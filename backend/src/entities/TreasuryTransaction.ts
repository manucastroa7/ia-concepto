import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class TreasuryTransaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("uuid")
    accountId!: string;

    @Column()
    type!: string;

    @Column()
    category!: string;

    @Column("decimal", { precision: 14, scale: 2 })
    amount!: number;

    @Column({ type: "date" })
    date!: string;

    @Column({ nullable: true })
    reference!: string;

    @Column({ nullable: true })
    relatedEntityId!: string;

    @Column({ nullable: true })
    relatedEntityType!: string;

    @Column({ nullable: true })
    tenantId!: string;

    @Column({ nullable: true })
    paymentMethod!: string;

    @Column("uuid", { nullable: true })
    bookingFileId!: string | null;

    @Column("uuid", { nullable: true })
    invoiceId!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
