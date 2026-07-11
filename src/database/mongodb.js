import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log(`Connected to database in ${NODE_ENV} mode`);
  } catch (error) {
    console.error("Error connecting to database: ", error);
    process.exit(1);
  }
};

const CONNECTION_STATE_LABELS = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export const getConnectionStateLabel = () =>
  CONNECTION_STATE_LABELS[mongoose.connection.readyState] ?? "unknown";

export default connectToDatabase;
