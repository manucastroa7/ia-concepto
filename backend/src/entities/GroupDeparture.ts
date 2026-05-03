import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GroupDeparture {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  operator!: string;

  @Column()
  destination!: string;

  @Column({ nullable: true })
  title!: string;

  @Column({ nullable: true })
  departureDate!: string;

  @Column({ nullable: true })
  returnDate!: string;

  @Column({ nullable: true })
  price!: string;

  @Column({ nullable: true })
  currency!: string;

  @Column("simple-array", { nullable: true })
  inclusions!: string[];

  @Column({ nullable: true })
  capacity!: string;

  @Column({ nullable: true })
  deadline!: string;

  @Column({ nullable: true })
  guide!: string;

  @Column("text", { nullable: true })
  whatsappMessage!: string;

  @Column("text", { nullable: true })
  flyerHtml!: string;

  @CreateDateColumn()
  createdAt!: Date;

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
