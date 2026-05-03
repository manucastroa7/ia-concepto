import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class AgencySettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: "Concepto Evt" })
  name!: string;

  @Column({ default: "" })
  phone!: string;

  @Column({ default: "Viajá con quien sabe" })
  slogan!: string;

  @Column({ default: "#1e3a5f" })
  colorPrimary!: string;

  @Column({ default: "#f97316" })
  colorAccent!: string;

  @Column({ nullable: true })
  logoFullUrl!: string;

  @Column({ nullable: true })
  logoCompactUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
