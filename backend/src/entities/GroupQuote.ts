import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class GroupQuote {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true })
    quoteNumber!: string;

    @Column({ nullable: true })
    groupName!: string;

    @Column({ nullable: true })
    clientName!: string;

    @Column({ nullable: true })
    destination!: string;

    @Column({ nullable: true })
    startDate!: string;

    @Column({ nullable: true })
    endDate!: string;

    @Column({ nullable: true })
    validUntil!: string;

    @Column({ default: 0 })
    pax!: number;

    @Column({ default: "USD" })
    currency!: string;

    @Column({ default: 20 })
    globalCommission!: number;

    @Column("jsonb", { default: [] })
    services!: any[];

    @Column("text", { nullable: true })
    includes!: string;

    @Column("text", { nullable: true })
    excludes!: string;

    @Column("text", { nullable: true })
    observations!: string;

    @Column({ default: "draft" })
    status!: string;

    @Column("decimal", { precision: 14, scale: 2, default: 0 })
    totalPerPerson!: number;

    @Column("decimal", { precision: 14, scale: 2, default: 0 })
    totalSelling!: number;

    @Column("decimal", { precision: 14, scale: 2, default: 0 })
    totalNet!: number;

    @Column({ default: "percent" })
    commissionMode!: string;

    @Column("decimal", { precision: 14, scale: 2, nullable: true })
    priceOverride!: number | null;

    @Column("jsonb", { default: [] })
    payments!: any[];

    @Column("jsonb", { default: [] })
    providerPayments!: any[];

    @Column({ nullable: true })
    project!: string;

    @Column("jsonb", { default: [] })
    passengerIds!: string[];

    @Column("text", { nullable: true })
    clientNotes!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
