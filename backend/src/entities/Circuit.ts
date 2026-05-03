import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Circuit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  codigo_circuito!: string;

  @Column({ nullable: true })
  nombre!: string;

  @Column("simple-json", { nullable: true })
  duracion!: { dias: number; noches: number };

  @Column("simple-array", { nullable: true })
  paises_visitados!: string[];

  @Column("simple-array", { nullable: true })
  ciudades_itinerario!: string[];

  @Column("simple-array", { nullable: true })
  meses_operacion!: string[];

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  precio_base_eur!: number;

  @Column("simple-json", { nullable: true })
  itinerario_resumido!: { dia: number; descripcion: string }[];

  @Column("simple-array", { nullable: true })
  hoteles_previstos!: string[];

  @Column({ nullable: true })
  operator!: string;

  @Column()
  destination!: string;

  @Column({ nullable: true })
  title!: string;

  @Column({ nullable: true })
  duration!: string;

  @Column({ nullable: true })
  price!: string;

  @Column({ nullable: true })
  currency!: string;

  @Column({ nullable: true })
  dates!: string;

  @Column("simple-array", { nullable: true })
  inclusions!: string[];

  @Column("simple-array", { nullable: true })
  exclusions!: string[];

  @Column("text", { nullable: true })
  rawText!: string;

  // --- Caching Diffusion Data ---
  @Column("text", { nullable: true })
  whatsappMessage!: string;

  @Column("simple-json", { nullable: true })
  flyerData!: any;

  @Column({ nullable: true })
  categoria!: string;

  @Column({ nullable: true })
  sourceFile!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // --- Web Publishing Fields ---
  @Column({ default: false })
  isPublished!: boolean;

  @Column({ nullable: true })
  webCategory!: string;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column("simple-array", { nullable: true })
  tags!: string[];

  @Column("simple-array", { nullable: true })
  highlights!: string[];
}
