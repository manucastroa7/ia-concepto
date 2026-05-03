import { AppDataSource } from "../src/data-source";

async function run() {
  try {
    await AppDataSource.initialize();
    await AppDataSource.dropDatabase();
    await AppDataSource.synchronize(true);
    console.log("Database wiped perfectly.");
    process.exit(0);
  } catch (error) {
    console.error("Error wiping database:", error);
    process.exit(1);
  }
}

run();
