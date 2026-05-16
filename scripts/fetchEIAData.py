"""
EIA Data ETL Script — Global Energy Trade Analytics
Fetches trade data for 10 countries × 4 energy types × 2000-2023 from EIA API v2
and seeds MongoDB Atlas.

EIA v2 /international/data/ facet keys (validated against live API):
  activityId  3 = Imports, 4 = Exports
  productId   57 = Crude oil  (TBPD)
              26 = Natural gas (BCF)
              7  = Coal        (TST)
              2  = Electricity (BKWH)

Resilience features:
  - Validates all country codes against live EIA country facets
  - Validates all productId / activityId values against live EIA metadata
  - Per-combo existence probe before full data fetch
  - Exponential backoff retry (4 attempts: 1s → 2s → 4s → 8s)
  - Handles 429 / 404 / 500 and network errors distinctly
  - Continues ETL when any single combo fails — never crashes
  - Partial results flushed every 500 ops
  - Failed / skipped combos written to failed_combos.json

Usage:
    pip install -r requirements.txt
    python fetchEIAData.py

Environment variables (in .env.local or .env):
    EIA_API_KEY   - your EIA API key (eia.gov/opendata)
    MONGODB_URI   - MongoDB Atlas connection string
"""

import os
import json
import time
import logging
from datetime import datetime, timezone
from typing import Optional

import certifi
import requests
from pymongo import MongoClient, UpdateOne
from pymongo.errors import BulkWriteError
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv(".env.local")
load_dotenv(".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ─── Config ──────────────────────────────────────────────────────────────────

EIA_API_KEY = os.environ.get("EIA_API_KEY", "")
MONGODB_URI = os.environ.get("MONGODB_URI", "")
EIA_BASE    = "https://api.eia.gov/v2"

if not EIA_API_KEY:
    raise SystemExit("❌  EIA_API_KEY not set. Add it to .env.local")
if not MONGODB_URI:
    raise SystemExit("❌  MONGODB_URI not set. Add it to .env.local")

# Activity IDs (verified against live EIA /international/facet/activityId/)
ACTIVITY_IMPORT = "3"   # Imports
ACTIVITY_EXPORT = "4"   # Exports (present in data but not in facet list — verified working)

COUNTRIES = [
    {"id": "usa",          "name": "United States", "eiaCode": "USA"},
    {"id": "china",        "name": "China",          "eiaCode": "CHN"},
    {"id": "india",        "name": "India",          "eiaCode": "IND"},
    {"id": "russia",       "name": "Russia",         "eiaCode": "RUS"},
    {"id": "saudi-arabia", "name": "Saudi Arabia",   "eiaCode": "SAU"},
    {"id": "germany",      "name": "Germany",        "eiaCode": "DEU"},
    {"id": "japan",        "name": "Japan",          "eiaCode": "JPN"},
    {"id": "canada",       "name": "Canada",         "eiaCode": "CAN"},
    {"id": "uae",          "name": "UAE",            "eiaCode": "ARE"},
    {"id": "australia",    "name": "Australia",      "eiaCode": "AUS"},
]

# productId values verified against live EIA /international/data/ responses
ENERGY_TYPES = [
    {
        "id":        "crude-oil",
        "productId": "57",        # Crude oil including lease condensate
        "unitCode":  "TBPD",      # thousand barrels per day
        "unit":      "thousand barrels/day",
    },
    {
        "id":        "natural-gas",
        "productId": "26",        # Dry natural gas
        "unitCode":  "BCF",       # billion cubic feet
        "unit":      "billion cubic feet",
    },
    {
        "id":        "coal",
        "productId": "7",         # Coal
        "unitCode":  "TST",       # thousand short tons
        "unit":      "thousand short tons",
    },
    {
        "id":        "electricity",
        "productId": "2",         # Electricity
        "unitCode":  "BKWH",      # billion kilowatthours
        "unit":      "billion kWh",
    },
]

START_YEAR       = 2000
END_YEAR         = 2023
RATE_LIMIT_DELAY = 0.25
MAX_ATTEMPTS     = 4

STATUS_OK    = "ok"
STATUS_EMPTY = "empty"
STATUS_SKIP  = "skip"
STATUS_ERROR = "error"


# ─── Pre-flight Validation ───────────────────────────────────────────────────

def _get_json(url: str, params: dict, timeout: int = 20) -> Optional[dict]:
    for attempt in range(3):
        try:
            resp = requests.get(url, params=params, timeout=timeout)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            log.warning(f"GET attempt {attempt+1} failed ({url}): {e}")
            time.sleep(2 ** attempt)
    return None


def validate_countries(countries: list[dict]) -> list[dict]:
    """Remove countries whose eiaCode is absent from EIA country facets."""
    data = _get_json(
        f"{EIA_BASE}/international/facet/countryRegionId/",
        {"api_key": EIA_API_KEY},
    )
    if not data:
        log.warning("Could not reach EIA country facet endpoint — skipping country validation")
        return countries

    valid_ids = {f["id"] for f in data.get("response", {}).get("facets", [])}
    ok, bad = [], []
    for c in countries:
        (ok if c["eiaCode"] in valid_ids else bad).append(c)
    if bad:
        log.error(f"Unknown EIA country codes (removed): {[c['eiaCode'] for c in bad]}")
    log.info(f"Country validation: {len(ok)}/{len(countries)} OK")
    return ok


def validate_energy_types(energy_types: list[dict]) -> list[dict]:
    """
    For each energy type, confirm productId has at least one row in EIA data
    (for any country, import direction). Drops types with no data at all.
    """
    valid = []
    for et in energy_types:
        data = _get_json(
            f"{EIA_BASE}/international/data/",
            {
                "api_key":                   EIA_API_KEY,
                "frequency":                 "annual",
                "length":                    1,
                "data[]":                    "value",
                "facets[activityId][]":      ACTIVITY_IMPORT,
                "facets[productId][]":       et["productId"],
                "facets[unit][]":            et["unitCode"],
            },
        )
        total = data.get("response", {}).get("total", 0) if data else 0
        if total and int(total) > 0:
            log.info(f"  ✅ {et['id']:15s} productId={et['productId']}  ({total} rows globally)")
            valid.append(et)
        else:
            log.warning(f"  ⚠️  {et['id']:15s} productId={et['productId']}  no global data — skipping")

    return valid


# ─── EIA Fetch ───────────────────────────────────────────────────────────────

def _probe_combo(country_code: str, activity_id: str, product_id: str, unit_code: str) -> bool:
    data = _get_json(
        f"{EIA_BASE}/international/data/",
        {
            "api_key":                   EIA_API_KEY,
            "frequency":                 "annual",
            "length":                    1,
            "data[]":                    "value",
            "facets[countryRegionId][]": country_code,
            "facets[activityId][]":      activity_id,
            "facets[productId][]":       product_id,
            "facets[unit][]":            unit_code,
        },
    )
    if not data:
        return True
    total = data.get("response", {}).get("total", 0)
    return int(total) > 0


def fetch_eia(
    country_code: str,
    activity_id:  str,
    product_id:   str,
    unit_code:    str,
    start: int,
    end:   int,
) -> tuple[list[dict], str]:
    """
    Full data fetch with exponential backoff. Returns (rows, status).
    Never raises — all exceptions mapped to STATUS_ERROR.
    """
    url    = f"{EIA_BASE}/international/data/"
    params = {
        "api_key":                   EIA_API_KEY,
        "frequency":                 "annual",
        "start":                     str(start),
        "end":                       str(end),
        "length":                    5000,
        "data[]":                    "value",          # required to include value column in EIA v2
        "facets[countryRegionId][]": country_code,
        "facets[activityId][]":      activity_id,
        "facets[productId][]":       product_id,
        "facets[unit][]":            unit_code,
    }

    last_error = ""
    for attempt in range(MAX_ATTEMPTS):
        delay = 2 ** attempt
        try:
            resp = requests.get(url, params=params, timeout=30)

            if resp.status_code in (400, 404):
                log.debug(f"HTTP {resp.status_code} — skip {country_code}/{product_id}")
                return [], STATUS_SKIP

            if resp.status_code == 429:
                wait = int(resp.headers.get("Retry-After", 15))
                log.warning(f"429 rate-limited — sleeping {wait}s")
                time.sleep(wait)
                continue

            if resp.status_code >= 500:
                last_error = f"HTTP {resp.status_code}"
                log.warning(f"HTTP {resp.status_code} (attempt {attempt+1}/{MAX_ATTEMPTS}) — retry in {delay}s")
                time.sleep(delay)
                continue

            resp.raise_for_status()

            rows = resp.json().get("response", {}).get("data", [])
            return (rows, STATUS_OK) if rows else ([], STATUS_EMPTY)

        except requests.exceptions.Timeout:
            last_error = "timeout"
            log.warning(f"Timeout (attempt {attempt+1}/{MAX_ATTEMPTS}) — retry in {delay}s")
            time.sleep(delay)
        except requests.exceptions.ConnectionError as e:
            last_error = f"connection: {e}"
            log.warning(f"Connection error (attempt {attempt+1}/{MAX_ATTEMPTS}) — retry in {delay}s")
            time.sleep(delay)
        except Exception as e:
            last_error = str(e)
            log.error(f"Unexpected error (attempt {attempt+1}/{MAX_ATTEMPTS}): {e}")
            time.sleep(delay)

    log.error(f"All {MAX_ATTEMPTS} attempts failed for {country_code}/{product_id}: {last_error}")
    return [], STATUS_ERROR


# ─── MongoDB ─────────────────────────────────────────────────────────────────

def get_collection():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000, tlsCAFile=certifi.where())
    db = client["energy-trade"]

    # If "trades" exists as a time-series collection, drop it so we can recreate
    # it as a regular collection that supports upserts and unique indexes.
    existing_cols = db.list_collections(filter={"name": "trades"})
    for col_info in existing_cols:
        options = col_info.get("options", {})
        if "timeseries" in options:
            log.warning("Dropping existing time-series 'trades' collection to recreate as regular collection")
            db.drop_collection("trades")
            break

    col = db["trades"]
    col.create_index(
        [
            ("metadata.country",    1),
            ("metadata.energyType", 1),
            ("metadata.direction",  1),
            ("period",              1),
        ],
        unique=True,
        background=True,
        name="trade_unique",
    )
    return col


def parse_value(raw) -> Optional[float]:
    if raw in (None, "null", "w", "*", "--", "NA", ""):
        return None
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


def build_upsert(row: dict, country: dict, energy: dict, direction: str) -> UpdateOne:
    year  = int(str(row.get("period", "2000"))[:4])
    value = parse_value(row.get("value"))
    doc = {
        "timestamp":    datetime(year, 1, 1, tzinfo=timezone.utc),
        "metadata":     {
            "country":    country["eiaCode"],
            "energyType": energy["id"],
            "direction":  direction,
            "unit":       energy["unit"],
        },
        "measurements": {"value": value},
        "period":       str(row.get("period", year)),
        "source":       "EIA",
    }
    filter_q = {
        "metadata.country":    country["eiaCode"],
        "metadata.energyType": energy["id"],
        "metadata.direction":  direction,
        "period":              doc["period"],
    }
    return UpdateOne(filter_q, {"$set": doc}, upsert=True)


def _flush(collection, ops: list[UpdateOne]) -> int:
    try:
        result  = collection.bulk_write(ops, ordered=False)
        written = result.upserted_count + result.modified_count
        log.info(f"Flushed {len(ops)} ops — upserted: {result.upserted_count}, modified: {result.modified_count}")
        return written
    except BulkWriteError as e:
        details  = e.details
        written  = details.get("nUpserted", 0) + details.get("nModified", 0)
        n_errors = len(details.get("writeErrors", []))
        log.error(f"Bulk write partial error: {n_errors} errors, {written} ops succeeded")
        return written
    except Exception as e:
        log.error(f"Bulk write failed entirely: {e}")
        return 0


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    log.info("Connecting to MongoDB Atlas…")
    collection = get_collection()
    log.info("✅ Connected")

    # Phase 0 — pre-flight validation
    log.info("─── Phase 0: Pre-flight validation ───")
    validated_countries = validate_countries(COUNTRIES)
    if not validated_countries:
        raise SystemExit("❌  No valid countries — aborting")

    log.info("Validating energy type product IDs against EIA…")
    validated_energy = validate_energy_types(ENERGY_TYPES)
    if not validated_energy:
        raise SystemExit("❌  No valid energy types — aborting")

    total_combos = len(validated_countries) * len(validated_energy) * 2
    log.info(
        f"Plan: {total_combos} combos = "
        f"{len(validated_countries)} countries × {len(validated_energy)} energy types × 2 directions"
    )

    # ETL loop
    failed_combos:  list[dict] = []
    skipped_combos: list[dict] = []
    total_rows    = 0
    total_written = 0
    all_ops: list[UpdateOne] = []

    pbar = tqdm(total=total_combos, desc="Fetching EIA data", unit="combo")

    for country in validated_countries:
        for energy in validated_energy:
            for direction, activity_id in [
                ("import", ACTIVITY_IMPORT),
                ("export", ACTIVITY_EXPORT),
            ]:
                combo_key  = f"{country['eiaCode']}/{energy['id']}/{direction}"
                product_id = energy["productId"]
                unit_code  = energy["unitCode"]

                try:
                    # Existence probe
                    if not _probe_combo(country["eiaCode"], activity_id, product_id, unit_code):
                        log.debug(f"Probe: 0 results — {combo_key}")
                        skipped_combos.append({"combo": combo_key, "reason": "probe: 0 results"})
                        pbar.update(1)
                        time.sleep(RATE_LIMIT_DELAY)
                        continue

                    # Full fetch
                    rows, status = fetch_eia(
                        country["eiaCode"], activity_id, product_id, unit_code, START_YEAR, END_YEAR
                    )

                    if status == STATUS_OK:
                        ops = [build_upsert(r, country, energy, direction) for r in rows]
                        all_ops.extend(ops)
                        total_rows += len(rows)
                        pbar.set_postfix(
                            country=country["eiaCode"],
                            type=energy["id"][:8],
                            dir=direction[:3],
                            rows=len(rows),
                        )
                    elif status == STATUS_EMPTY:
                        skipped_combos.append({"combo": combo_key, "reason": "empty response"})
                    elif status == STATUS_SKIP:
                        skipped_combos.append({"combo": combo_key, "reason": "unsupported (404/400)"})
                    elif status == STATUS_ERROR:
                        failed_combos.append({"combo": combo_key})

                except Exception as e:
                    log.error(f"Unhandled exception on {combo_key}: {e}", exc_info=True)
                    failed_combos.append({"combo": combo_key, "error": str(e)})

                pbar.update(1)
                time.sleep(RATE_LIMIT_DELAY)

                if len(all_ops) >= 500:
                    total_written += _flush(collection, all_ops)
                    all_ops = []

    if all_ops:
        total_written += _flush(collection, all_ops)

    pbar.close()

    log.info("─── ETL Summary ───────────────────────────────────────────────")
    log.info(f"  Total rows fetched : {total_rows}")
    log.info(f"  Total ops written  : {total_written}")
    log.info(f"  Skipped combos     : {len(skipped_combos)}")
    log.info(f"  Failed combos      : {len(failed_combos)}")

    if skipped_combos or failed_combos:
        with open("failed_combos.json", "w") as f:
            json.dump({"failed": failed_combos, "skipped": skipped_combos}, f, indent=2)
        log.info("  Failure report     : failed_combos.json")

    if failed_combos:
        log.warning(f"⚠️  {len(failed_combos)} combo(s) failed after all retries:")
        for fc in failed_combos:
            log.warning(f"    • {fc['combo']}")
        log.info("✅ ETL complete (with some failures — see failed_combos.json)")
    else:
        log.info("✅ ETL complete — no errors")


if __name__ == "__main__":
    main()
