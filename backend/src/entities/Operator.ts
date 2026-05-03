import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Operator {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    name!: string;

    @Column("decimal", { precision: 5, scale: 2, default: 0 })
    defaultCommissionPercentage!: number;

    @Column({ nullable: true })
    contactEmail!: string;

    @Column({ nullable: true })
    contactPhone!: string;

    @Column("text", { nullable: true })
    internalNotes!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
