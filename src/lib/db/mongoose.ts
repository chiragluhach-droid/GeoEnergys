import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global to preserve connection across hot reloads in dev
const globalWithMongoose = global as typeof globalThis & { mongooseCache?: MongooseCache };

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null };
}

const cache = globalWithMongoose.mongooseCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    // Inject database name before the query string if not already present
    const uri = MONGODB_URI.replace(
      /^(mongodb(?:\+srv)?:\/\/[^/]+\/?)(\?|$)/,
      "$1energy-trade$2"
    );

    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => m);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
