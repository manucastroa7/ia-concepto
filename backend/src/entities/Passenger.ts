import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ManualQuote } from "./ManualQuote";

@Entity()
export class Passenger {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    surname!: string;

    @Column({ nullable: true })
    email!: string;

    @Column({ nullable: true })
    whatsapp!: string;

    @Column("text", { nullable: true })
    notes!: string;

    @OneToMany(() => ManualQuote, (quote) => quote.passenger)
    quotes!: ManualQuote[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
