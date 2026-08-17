import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Passenger } from "./Passenger";

@Entity()
export class ManualQuote {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true })
    passengerId!: string;

    @ManyToOne(() => Passenger, (passenger) => passenger.quotes)
    passenger!: Passenger;

    @Column({ nullable: true })
    reference!: string;

    @Column({ nullable: true })
    title!: string;

    @Column({ nullable: true })
    destination!: string;

    @Column({ default: "USD" })
    currency!: string;

    @Column("jsonb", { default: [] })
    passengers!: any[];

    @Column("jsonb", { default: [] })
    items!: any[];

    @Column("text", { nullable: true })
    notes!: string;

    @Column("text", { nullable: true })
    clientRequestNotes!: string;

    @Column({ nullable: true })
    clientName!: string;

    @Column({ nullable: true })
    startDate!: string;

    @Column({ nullable: true })
    endDate!: string;

    @Column({ default: 1 })
    paxCount!: number;

    @Column("jsonb", { default: [] })
    additionalPassengers!: string[];

    @Column("jsonb", { default: [] })
    payments!: any[];

    @Column("jsonb", { default: [] })
    providerPayments!: any[];

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    globalAdjustment!: number;

    @Column({ default: "draft" })
    status!: "draft" | "sent" | "follow_up" | "reserved" | "sold" | "lost";

    @Column({ type: "timestamp", nullable: true })
    nextFollowUp!: Date;

    @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
    soldPriceCollected!: number;

    @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
    totalNetCostSnapshot!: number;

    @Column({ type: "timestamp", nullable: true })
    soldAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
