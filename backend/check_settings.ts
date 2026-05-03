import { AppDataSource } from "./src/data-source";
import { AgencySettings } from "./src/entities/AgencySettings";
import * as dotenv from "dotenv";
dotenv.config();

async function check() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(AgencySettings);
  const settings = await repo.findOne({ where: { id: 1 } });
  console.log("CURRENT SETTINGS:", JSON.stringify(settings, null, 2));
  process.exit(0);
}

check();
