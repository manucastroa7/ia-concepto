import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class WebPackage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  subtitle!: string;

  @Column({ nullable: true })
  sourceId!: string; // Link to Circuit.id to avoid duplicates

  @Column("text")
  description!: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  price!: number;

  @Column({ nullable: true })
  currency!: string;

  @Column({ nullable: true })
  duration!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({ default: true })
  isPublished!: boolean;

  @Column()
  webCategory!: string;

  @Column({ nullable: true })
  imageUrl!: string;

  // ─── PROMO FIELDS ────────────────────────────────────────
  @Column({ default: false })
  isPromo!: boolean;

  @Column({ nullable: true })
  promoLabel!: string; // e.g. "-15%", "ÚLTIMOS LUGARES", "BLACK FRIDAY"

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  originalPrice!: number; // struck-through price for anchoring

  @Column({ type: "timestamp", nullable: true })
  promoEndsAt!: Date; // countdown target

  @Column({ default: false })
  isHeroBanner!: boolean; // show in the top announcement bar

  @Column({ nullable: true })
  heroBannerText!: string; // "🔥 Últimos lugares: 20% OFF en Caribe"

  @Column("simple-array", { nullable: true })
  tags!: string[];

  @Column("simple-array", { nullable: true })
  highlights!: string[];

  @Column("simple-array", { nullable: true })
  included!: string[];

  @Column("simple-array", { nullable: true })
  excluded!: string[];

  @Column("simple-json", { nullable: true })
  itinerary!: { day: number; title: string; activities: string[] }[];

  @Column("text", { nullable: true })
  notes!: string;

  @Column("simple-json", { nullable: true })
  customSections!: { title: string; content: string }[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
