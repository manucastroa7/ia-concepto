import { AppDataSource } from "./data-source";
import { ManualQuote } from "./entities/ManualQuote";
import { Passenger } from "./entities/Passenger";

async function seed() {
  await AppDataSource.initialize();
  console.log("Database initialized for seeding...");

  const quoteRepo = AppDataSource.getRepository(ManualQuote);
  const passengerRepo = AppDataSource.getRepository(Passenger);

  const quotes = await quoteRepo.find({ relations: ["passenger"] });
  console.log(`Found ${quotes.length} quotes to update...`);

  for (const q of quotes) {
    const pName = q.passenger ? `${q.passenger.name} ${q.passenger.surname}` : q.title;

    if (pName.includes("CASTRO") || q.title?.includes("Familia") || q.title?.includes("CASTRO")) {
      q.destination = "Europa (Madrid & Barcelona)";
      q.status = "reserved";
      q.soldPriceCollected = 4500;
      q.totalNetCostSnapshot = 3600;
      q.items = [
        {
          id: "item-1",
          type: "flight",
          providerId: "",
          details: {
            airline: "Iberia Airlines",
            bookingCode: "IB-78492X",
            type: "ROUND_TRIP",
            segments: [
              { id: "seg-1", from: "EZE", to: "MAD", departureDate: "10/10/2026", departureTime: "21:40", arrivalDate: "11/10/2026", arrivalTime: "14:20" },
              { id: "seg-2", from: "BCN", to: "EZE", departureDate: "24/10/2026", departureTime: "18:10", arrivalDate: "25/10/2026", arrivalTime: "04:30" }
            ],
            baggage: { hasHand: true, handDesc: "Mochila", hasCarryOn: true, carryOnDesc: "10kg", hasChecked: true, checkedDesc: "23kg" }
          },
          economics: {
            baseNetCost: 1400,
            adjustments: [],
            pricingModel: "total",
            passengerCount: 2,
            commissionType: "fixed",
            commissionValue: 300
          },
          price: 1700
        },
        {
          id: "item-2",
          type: "hotel",
          providerId: "",
          details: {
            hotelName: "Hotel Riu Plaza España",
            confirmationNumber: "MAD-99214",
            checkIn: "11/10/2026",
            checkOut: "16/10/2026",
            rooms: [{ id: "r-1", type: "Doble Deluxe", board: "Desayuno Buffet", paxCount: 2 }]
          },
          economics: {
            baseNetCost: 900,
            adjustments: [],
            pricingModel: "total",
            passengerCount: 2,
            commissionType: "fixed",
            commissionValue: 200
          },
          price: 1100
        },
        {
          id: "item-3",
          type: "train",
          providerId: "",
          details: {
            trainOperator: "Renfe AVE",
            trainNumber: "AVE 03141",
            bookingCode: "RENFE-8821X",
            origin: "Madrid (Atocha)",
            destination: "Barcelona (Sants)",
            departureDate: "16/10/2026",
            departureTime: "10:30",
            arrivalDate: "16/10/2026",
            arrivalTime: "13:00",
            classType: "Primera / Confort",
            seatDetails: "Coche 4 - Asientos 12A y 12B"
          },
          economics: {
            baseNetCost: 200,
            adjustments: [],
            pricingModel: "total",
            passengerCount: 2,
            commissionType: "fixed",
            commissionValue: 50
          },
          price: 250
        },
        {
          id: "item-4",
          type: "hotel",
          providerId: "",
          details: {
            hotelName: "Hotel Majestic BCN 5*",
            confirmationNumber: "BCN-55102",
            checkIn: "16/10/2026",
            checkOut: "24/10/2026",
            rooms: [{ id: "r-2", type: "Junior Suite", board: "Desayuno", paxCount: 2 }]
          },
          economics: {
            baseNetCost: 1100,
            adjustments: [],
            pricingModel: "total",
            passengerCount: 2,
            commissionType: "fixed",
            commissionValue: 250
          },
          price: 1350
        },
        {
          id: "item-5",
          type: "transfer",
          providerId: "",
          details: {
            origin: "Aeropuerto Barajas (MAD)",
            destination: "Hotel Riu Plaza España",
            isRoundTrip: true,
            date: "11/10/2026",
            time: "15:00",
            confirmationNumber: "TR-MAD-01"
          },
          economics: {
            baseNetCost: 80,
            adjustments: [],
            pricingModel: "total",
            passengerCount: 2,
            commissionType: "fixed",
            commissionValue: 20
          },
          price: 100
        }
      ];
    } else if (pName.includes("OTERO") || q.title?.includes("OTERO")) {
      q.destination = "Punta Cana All Inclusive";
      q.soldPriceCollected = 2200;
      q.totalNetCostSnapshot = 1800;
      q.items = [
        {
          id: "item-otero-1",
          type: "flight",
          details: {
            airline: "Copa Airlines",
            bookingCode: "CM-4410",
            type: "ROUND_TRIP",
            segments: [
              { id: "s-1", from: "EZE", to: "PUJ", departureDate: "15/05/2026", departureTime: "01:30", arrivalDate: "15/05/2026", arrivalTime: "10:15" },
              { id: "s-2", from: "PUJ", to: "EZE", departureDate: "25/05/2026", departureTime: "12:00", arrivalDate: "25/05/2026", arrivalTime: "21:30" }
            ],
            baggage: { hasHand: true, handDesc: "Mochila", hasCarryOn: true, carryOnDesc: "10kg", hasChecked: true, checkedDesc: "23kg" }
          },
          economics: { baseNetCost: 900, adjustments: [], pricingModel: "total", passengerCount: 2, commissionType: "fixed", commissionValue: 150 },
          price: 1050
        },
        {
          id: "item-otero-2",
          type: "hotel",
          details: {
            hotelName: "Hard Rock Hotel & Casino Punta Cana",
            confirmationNumber: "HR-99012",
            checkIn: "15/05/2026",
            checkOut: "25/05/2026",
            rooms: [{ id: "r-otero", type: "Caribbean Suite", board: "All Inclusive Premium", paxCount: 2 }]
          },
          economics: { baseNetCost: 1100, adjustments: [], pricingModel: "total", passengerCount: 2, commissionType: "fixed", commissionValue: 200 },
          price: 1300
        }
      ];
    } else {
      q.destination = q.destination || "Europa Clásica";
      q.soldPriceCollected = q.soldPriceCollected || 1500;
      q.totalNetCostSnapshot = q.totalNetCostSnapshot || 1200;
      q.items = [
        {
          id: `item-gen-${q.id}-1`,
          type: "flight",
          details: {
            airline: "Air Europa",
            bookingCode: "UX-9912",
            type: "ROUND_TRIP",
            segments: [
              { id: "s-gen-1", from: "EZE", to: "MAD", departureDate: "05/09/2026", departureTime: "13:00", arrivalDate: "06/09/2026", arrivalTime: "06:00" }
            ]
          },
          economics: { baseNetCost: 850, adjustments: [], pricingModel: "total", passengerCount: 1, commissionType: "fixed", commissionValue: 150 },
          price: 1000
        },
        {
          id: `item-gen-${q.id}-2`,
          type: "assistance",
          details: {
            description: "Asistencia al Viajero Cobertura USD 150.000",
            confirmationNumber: "UA-998123"
          },
          economics: { baseNetCost: 100, adjustments: [], pricingModel: "total", passengerCount: 1, commissionType: "fixed", commissionValue: 30 },
          price: 130
        }
      ];
    }

    await quoteRepo.save(q);
    console.log(`Saved populated quote for: ${pName}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
