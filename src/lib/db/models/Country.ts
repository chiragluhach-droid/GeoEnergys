import mongoose, { Schema, Document } from "mongoose";

export interface ICountryDocument extends Document {
  id: string;
  name: string;
  eiaCode: string;
  flag: string;
  region: string;
  coordinates: [number, number];
  color: string;
  availableYears: number[];
}

const CountrySchema = new Schema<ICountryDocument>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    eiaCode: { type: String, required: true, unique: true },
    flag: { type: String, required: true },
    region: { type: String, required: true },
    coordinates: { type: [Number], required: true },
    color: { type: String, required: true },
    availableYears: { type: [Number], default: [] },
  },
  { timestamps: true }
);

export const Country =
  (mongoose.models.Country as mongoose.Model<ICountryDocument>) ||
  mongoose.model<ICountryDocument>("Country", CountrySchema);
