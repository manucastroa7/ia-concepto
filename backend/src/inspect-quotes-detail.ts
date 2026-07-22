import { AppDataSource } from "./data-source";
import { ManualQuote } from "./entities/ManualQuote";

async function inspectQuotes() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(ManualQuote);
  const quotes = await repo.find({ relations: ["passenger"] });
  console.log("=== MANUAL QUOTES IN POSTGRES DB ===");
  console.log(JSON.stringify(quotes, null, 2));
  process.exit(0);
}

inspectQuotes().catch(err => {
  console.error(err);
  process.exit(1);
});
