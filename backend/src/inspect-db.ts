import { AppDataSource } from "./data-source";

async function inspect() {
  await AppDataSource.initialize();
  console.log("=== INSPECTING POSTGRESQL DATABASE ===");

  const queryRunner = AppDataSource.createQueryRunner();

  // List all tables
  const tables = await queryRunner.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
    ORDER BY table_name;
  `);

  console.log("Tables in database:", tables.map((t: any) => t.table_name));

  for (const t of tables) {
    const tableName = t.table_name;
    const countRes = await queryRunner.query(`SELECT COUNT(*) FROM "${tableName}"`);
    const count = countRes[0].count;
    console.log(`\nTable [${tableName}] -> ${count} rows`);
    if (Number(count) > 0) {
      const rows = await queryRunner.query(`SELECT * FROM "${tableName}" LIMIT 5`);
      console.log(`Sample rows for [${tableName}]:`, JSON.stringify(rows, null, 2));
    }
  }

  await queryRunner.release();
  await AppDataSource.destroy();
  process.exit(0);
}

inspect().catch(err => {
  console.error("Inspect error:", err);
  process.exit(1);
});
