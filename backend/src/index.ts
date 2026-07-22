import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "20mb" }));

import { QuoteController } from "./controllers/QuoteController";
import { FlyerController } from "./controllers/FlyerController";
import { TariffController } from "./controllers/TariffController";
import { DepartureController } from "./controllers/DepartureController";
import { SettingsController } from "./controllers/SettingsController";
import { ManualQuoteController } from "./controllers/ManualQuoteController";
import { SaleController } from "./controllers/SaleController";
import { OperatorController } from "./controllers/OperatorController";
import { PassengerController } from "./controllers/PassengerController";
import { PublicPackageController } from "./controllers/PublicPackageController";
import { WebPackageController } from "./controllers/WebPackageController";
import { GroupQuoteController } from "./controllers/GroupQuoteController";
import { TreasuryController } from "./controllers/TreasuryController";

import { AppDataSource } from "./data-source";

// --- Legacy Quote Routes ---
app.post("/api/quotes", QuoteController.createQuote);
app.get("/api/quotes/:id", QuoteController.getQuote);
app.post("/api/quotes/alternatives/hotels", QuoteController.getAlternativeHotels);

// --- Module 1: Flyer Extractor ---
app.post("/api/flyers/extract", upload.single("file"), FlyerController.extractFlyer);
app.get("/api/flyers", FlyerController.getFlyers);
app.delete("/api/flyers/all", FlyerController.deleteAllFlyers);
app.post("/api/flyers/delete-multiple", FlyerController.deleteMultipleFlyers);
app.delete("/api/flyers/:id", FlyerController.deleteFlyer);
app.post("/api/flyers/render", FlyerController.renderFlyer);
app.post("/api/flyers/instagram-stories", FlyerController.generateInstagramStories);
app.post("/api/flyers/story-video", FlyerController.generateStoryVideo);
app.post("/api/flyers/assets", upload.single("file"), FlyerController.uploadAsset);
app.get("/api/flyers/assets", FlyerController.getAssets);
app.get("/api/flyers/attractions", FlyerController.getAttractions);
app.patch("/api/flyers/assets/:id", FlyerController.updateAsset);
app.delete("/api/flyers/assets/:id", FlyerController.deleteAsset);

// --- Module 2: Tariff / Circuit Search ---
app.post("/api/tariffs/upload", upload.single("file"), TariffController.uploadTariff);
app.post("/api/tariffs/reset-database", TariffController.resetDatabase);
app.get("/api/tariffs/search", TariffController.search);
app.post("/api/tariffs/ai-search", TariffController.aiSearch);
app.post("/api/tariffs/:id/generate-diffusion", TariffController.generateDiffusion);
app.get("/api/tariffs", TariffController.listAll);
app.delete("/api/tariffs/:id", TariffController.deleteCircuit);
app.put("/api/tariffs/:id/publish", TariffController.publishCircuit);
app.post("/api/tariffs/:id/image", upload.single("file"), TariffController.uploadCircuitImage);

// --- Module 3: Group Departures ---
app.post("/api/departures", DepartureController.create);
app.post("/api/departures/upload", upload.single("file"), DepartureController.uploadAndExtract);
app.get("/api/departures", DepartureController.list);
app.post("/api/departures/:id/regenerate", DepartureController.regenerate);
app.delete("/api/departures/:id", DepartureController.remove);
app.put("/api/departures/:id/publish", DepartureController.publishDeparture);


import { AppDataSource } from "./data-source";

// --- Legacy Quote Routes ---
app.post("/api/quotes", QuoteController.createQuote);
app.get("/api/quotes/:id", QuoteController.getQuote);
app.post("/api/quotes/alternatives/hotels", QuoteController.getAlternativeHotels);

// --- Module 1: Flyer Extractor ---
app.post("/api/flyers/extract", upload.single("file"), FlyerController.extractFlyer);
app.get("/api/flyers", FlyerController.getFlyers);
app.delete("/api/flyers/all", FlyerController.deleteAllFlyers);
app.post("/api/flyers/delete-multiple", FlyerController.deleteMultipleFlyers);
app.delete("/api/flyers/:id", FlyerController.deleteFlyer);
app.post("/api/flyers/render", FlyerController.renderFlyer);
app.post("/api/flyers/instagram-stories", FlyerController.generateInstagramStories);
app.post("/api/flyers/story-video", FlyerController.generateStoryVideo);
app.post("/api/flyers/assets", upload.single("file"), FlyerController.uploadAsset);
app.get("/api/flyers/assets", FlyerController.getAssets);
app.get("/api/flyers/attractions", FlyerController.getAttractions);
app.patch("/api/flyers/assets/:id", FlyerController.updateAsset);
app.delete("/api/flyers/assets/:id", FlyerController.deleteAsset);

// --- Module 2: Tariff / Circuit Search ---
app.post("/api/tariffs/upload", upload.single("file"), TariffController.uploadTariff);
app.post("/api/tariffs/reset-database", TariffController.resetDatabase);
app.get("/api/tariffs/search", TariffController.search);
app.post("/api/tariffs/ai-search", TariffController.aiSearch);
app.post("/api/tariffs/:id/generate-diffusion", TariffController.generateDiffusion);
app.get("/api/tariffs", TariffController.listAll);
app.delete("/api/tariffs/:id", TariffController.deleteCircuit);
app.put("/api/tariffs/:id/publish", TariffController.publishCircuit);
app.post("/api/tariffs/:id/image", upload.single("file"), TariffController.uploadCircuitImage);

// --- Module 3: Group Departures ---
app.post("/api/departures", DepartureController.create);
app.post("/api/departures/upload", upload.single("file"), DepartureController.uploadAndExtract);
app.get("/api/departures", DepartureController.list);
app.post("/api/departures/:id/regenerate", DepartureController.regenerate);
app.delete("/api/departures/:id", DepartureController.remove);
app.put("/api/departures/:id/publish", DepartureController.publishDeparture);

// --- Module 4: Agency Settings ---
app.get("/api/settings", SettingsController.getSettings);
app.post("/api/settings", SettingsController.updateSettings);
app.post("/api/settings/logo", upload.single("file"), SettingsController.uploadLogo);

// --- Module 5: Manual Quotes & Sales ---
app.get("/api/manual-quotes", ManualQuoteController.list);
app.get("/api/manual-quotes/:id", ManualQuoteController.get);
app.post("/api/manual-quotes", ManualQuoteController.create);
app.patch("/api/manual-quotes/:id", ManualQuoteController.update);
app.post("/api/manual-quotes/generate-whatsapp", ManualQuoteController.generateWhatsAppText);
app.post("/api/manual-quotes/parse-flight-ticket", upload.single("file"), ManualQuoteController.parseFlightTicket);

app.get("/api/group-quotes", GroupQuoteController.list);
app.post("/api/group-quotes", GroupQuoteController.create);
app.get("/api/group-quotes/:id", GroupQuoteController.get);
app.patch("/api/group-quotes/:id", GroupQuoteController.update);
app.delete("/api/group-quotes/:id", GroupQuoteController.remove);
app.post("/api/group-quotes/generate-whatsapp", GroupQuoteController.generateWhatsAppText);

app.get("/api/passengers", PassengerController.list);
app.get("/api/passengers/search", PassengerController.search);
app.get("/api/passengers/:id/details", PassengerController.getDetails);
app.post("/api/passengers", PassengerController.create);
app.patch("/api/passengers/:id", PassengerController.update);
app.post("/api/passengers/extract-passport", upload.single("file"), PassengerController.extractPassport);

app.post("/api/sales", SaleController.createFromQuote);
app.get("/api/sales", SaleController.list);
app.post("/api/sales/:id/payment", SaleController.updatePayment);

app.get("/api/treasury/accounts", TreasuryController.listAccounts);
app.post("/api/treasury/accounts", TreasuryController.createAccount);
app.patch("/api/treasury/accounts/:id", TreasuryController.updateAccount);
app.get("/api/treasury/transactions", TreasuryController.listTransactions);
app.post("/api/treasury/transactions", TreasuryController.createTransaction);
app.patch("/api/treasury/transactions/:id", TreasuryController.updateTransaction);
app.delete("/api/treasury/transactions/:id", TreasuryController.removeTransaction);

// --- Module 6: Operators Database ---
app.get("/api/operators", OperatorController.list);
app.post("/api/operators", OperatorController.create);
app.patch("/api/operators/:id", OperatorController.update);
app.delete("/api/operators/:id", OperatorController.remove);

// --- Web Packages (Vidriera CRM) ---
app.get("/api/web-packages", WebPackageController.list);
app.post("/api/web-packages", WebPackageController.create);
app.patch("/api/web-packages/:id", WebPackageController.update);
app.delete("/api/web-packages/:id", WebPackageController.remove);
app.put("/api/web-packages/:id/toggle-publish", WebPackageController.togglePublish);

// --- Module 6: Operators Database ---
app.get("/api/operators", OperatorController.list);
app.post("/api/operators", OperatorController.create);
app.patch("/api/operators/:id", OperatorController.update);
app.delete("/api/operators/:id", OperatorController.remove);

// --- Web Packages (Vidriera CRM) ---
app.get("/api/web-packages", WebPackageController.list);
app.post("/api/web-packages", WebPackageController.create);
app.patch("/api/web-packages/:id", WebPackageController.update);
app.delete("/api/web-packages/:id", WebPackageController.remove);
app.put("/api/web-packages/:id/toggle-publish", WebPackageController.togglePublish);
app.post("/api/web-packages/:id/image", upload.single("file"), WebPackageController.uploadImage);

// --- Public Endpoints para concepto-web ---
app.get("/api/public/packages", PublicPackageController.getPublicPackages);
app.get("/api/public/settings", SettingsController.getSettings);

app.get("/health", (req, res) => {
  res.json({ status: "ok", agency: process.env.AGENCY_NAME || "Concepto Evt" });
});

const bootstrap = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error during Data Source initialization", err);
    process.exit(1);
  }
};

bootstrap();
