import { AppDataSource } from "./data-source";
import { ManualQuote } from "./entities/ManualQuote";
import { Passenger } from "./entities/Passenger";

async function syncExact() {
  await AppDataSource.initialize();
  console.log("Syncing exact DB records...");

  const quoteRepo = AppDataSource.getRepository(ManualQuote);
  const passengerRepo = AppDataSource.getRepository(Passenger);

  // Find Horacio Mayorga passenger record
  const mayorgaPax = await passengerRepo.findOneBy({ surname: "MAYORGA SOMERVILLE" });

  const quotes = await quoteRepo.find({ relations: ["passenger"] });

  for (const q of quotes) {
    const title = (q.title || "").toLowerCase();

    if (title.includes("castro") || title.includes("familia")) {
      q.soldPriceCollected = 921.12;
      q.totalNetCostSnapshot = 700;
    } else if (title.includes("abadie") || title.includes("luciana")) {
      q.soldPriceCollected = 4030.42;
      q.totalNetCostSnapshot = 3200;
    } else if (title.includes("martino")) {
      q.soldPriceCollected = 4860.26;
      q.totalNetCostSnapshot = 3800;
    } else if (title.includes("mayorga") || title.includes("horacio")) {
      q.soldPriceCollected = 2969.32;
      q.totalNetCostSnapshot = 2300;
      if (mayorgaPax) {
        q.passengerId = mayorgaPax.id;
        q.passenger = mayorgaPax;
      }
    }

    await quoteRepo.save(q);
  }

  console.log("Synchronization complete!");
  process.exit(0);
}

syncExact().catch(err => {
  console.error(err);
  process.exit(1);
});
