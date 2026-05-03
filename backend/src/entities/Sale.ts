import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { ManualQuote } from "./ManualQuote";

@Entity()
export class Sale {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => ManualQuote, { nullable: true })
    @JoinColumn()
    quote?: ManualQuote;

    @Column()
    passengerName!: string;

    @Column("decimal", { precision: 12, scale: 2 })
    totalAmount!: number;

    @Column("decimal", { precision: 12, scale: 2, default: 0 })
    paidAmount!: number;

    @Column({ default: "USD" })
    currency!: string;

    @Column({ default: "pending" })
    paymentStatus!: "pending" | "partial" | "paid";

    @Column({ nullable: true })
    travelDate!: Date;

    @Column("text", { nullable: true })
    internalNotes!: string;

    @Column("jsonb", { default: [] })
    paymentHistory!: any[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
