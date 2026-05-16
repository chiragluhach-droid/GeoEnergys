import mongoose, { Schema, Document } from "mongoose";
import type { EnergyType } from "@/types/trade";

export interface ITradeDocument extends Document {
  timestamp: Date;
  metadata: {
    country: string;       // EIA country code e.g. "USA"
    energyType: EnergyType;
    direction: "import" | "export" | "production" | "consumption";
    unit: string;
  };
  measurements: {
    value: number | null;
  };
  period: string;          // original EIA period string e.g. "2023"
  source: "EIA";
}

const TradeSchema = new Schema<ITradeDocument>(
  {
    timestamp: { type: Date, required: true },
    metadata: {
      country: { type: String, required: true },
      energyType: {
        type: String,
        enum: ["crude-oil", "natural-gas", "lng", "coal", "electricity", "total"],
        required: true,
      },
      direction: { type: String, enum: ["import", "export", "production", "consumption"], required: true },
      unit: { type: String, required: true },
    },
    measurements: {
      value: { type: Number, default: null },
    },
    period: { type: String, required: true },
    source: { type: String, default: "EIA" },
  },
  {
    collection: "trades",
    autoCreate: false,
  }
);

// Compound index for fast filtered queries
TradeSchema.index(
  { "metadata.country": 1, "metadata.energyType": 1, "metadata.direction": 1, timestamp: -1 },
  { background: true }
);

export const Trade =
  (mongoose.models.Trade as mongoose.Model<ITradeDocument>) ||
  mongoose.model<ITradeDocument>("Trade", TradeSchema);
