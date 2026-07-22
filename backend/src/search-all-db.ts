import { AppDataSource } from "./data-source";

async function searchAll() {
  await AppDataSource.initialize();
  console.log("=== SEARCHING ALL TABLES IN POSTGRES DB ===");

  const queryRunner = AppDataSource.createQueryRunner();

  const tables = ["manual_quote", "sale", "quote", "group_quote", "circuit", "web_package", "flyer_doc", "operator", "passenger", "treasury_transaction"];

  for (const t of tables) {
    try {
      const rows = await queryRunner.query(`SELECT * FROM "${t}"`);
      console.log(`\nTable [${t}] total rows: ${rows.length}`);
      rows.forEach((r: any, idx: number) => {
        const jsonStr = JSON.stringify(r);
        if (jsonStr.includes("items") || jsonStr.includes("details") || jsonStr.includes("flight") || jsonStr.includes("hotel") || jsonStr.includes("Renfe") || jsonStr.includes("Iberia")) {
          console.log(`[${t}] Row ${idx}:`, jsonStr);
        }
      });
    } catch (e: any) {
      console.log(`Table [${t}] query failed:`, e.message);
    }
  }

  await queryRunner.release();
  await AppDataSource.destroy();
  process.exit(0);
}

searchAll().catch(err => {
  console.error(err);
  process.exit(1);
});
