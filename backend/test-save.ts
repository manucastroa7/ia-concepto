import { AppDataSource } from "../src/data-source";
import { ManualQuote } from "../src/entities/ManualQuote";

async function test() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source initialized");
        const repo = AppDataSource.getRepository(ManualQuote);
        
        const testQuote = repo.create({
            title: "Test Save",
            status: "draft",
            items: [],
            soldPriceCollected: 100.50
        });
        
        await repo.save(testQuote);
        console.log("Save successful:", testQuote.id);
        
        await repo.remove(testQuote);
        console.log("Cleanup successful");
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

test();
