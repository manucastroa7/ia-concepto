import "reflect-metadata";
import { DataSource } from "typeorm";
import { Quote } from "./entities/Quote";
import { FlyerDoc } from "./entities/FlyerDoc";
import { Circuit } from "./entities/Circuit";
import { GroupDeparture } from "./entities/GroupDeparture";
import { DestinationAsset } from "./entities/DestinationAsset";
import { AgencySettings } from "./entities/AgencySettings";
import { ManualQuote } from "./entities/ManualQuote";
import { Sale } from "./entities/Sale";
import { Operator } from "./entities/Operator";
import { Passenger } from "./entities/Passenger";
import { WebPackage } from "./entities/WebPackage";
import { GroupQuote } from "./entities/GroupQuote";
import { TreasuryAccount } from "./entities/TreasuryAccount";
import { TreasuryTransaction } from "./entities/TreasuryTransaction";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "Riverplate912",
    database: process.env.DB_NAME || "travel_agency",
    synchronize: true,
    logging: false,
    entities: [Quote, FlyerDoc, Circuit, GroupDeparture, DestinationAsset, AgencySettings, ManualQuote, Sale, Operator, Passenger, WebPackage, GroupQuote, TreasuryAccount, TreasuryTransaction],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: [],
});
