import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Quote {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ default: 'Buenos Aires' })
    originCity!: string;

    @Column()
    destination!: string;

    @Column("int")
    travelersCount!: number;

    @Column()
    hotelCategory!: string;

    @Column("boolean")
    directFlights!: boolean;

    @Column()
    tripStyle!: string;

    @Column("boolean")
    isCentric!: boolean;

    @Column("decimal")
    budget!: number;

    @Column({ default: false })
    activitiesQuote!: boolean;

    @Column({ default: 'Doble' })
    roomDistribution!: string;

    @Column({ default: 'Hotel' })
    accommodationType!: string;

    @Column("int", { default: 7 })
    durationDays!: number;

    @Column({ default: 'Flexibles' })
    travelDates!: string;

    @Column({ default: 'Desayuno' })
    mealPlan!: string;

    @Column("jsonb", { nullable: true })
    aiResponse!: any;

    @CreateDateColumn()
    createdAt!: Date;
}
