import app from "./src/app.js";
import { PORT } from "./src/config/env.js";
import connectToDatabase from "./src/database/mongodb.js";

const startServer = async () => {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`SubVault API is running on http://localhost:${PORT}`);
  });
};

startServer();
