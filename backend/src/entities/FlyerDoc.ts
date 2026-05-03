import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FlyerDoc {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  originalName!: string;

  @Column({ nullable: true })
  mimeType!: string;

  @Column("jsonb", { nullable: true })
  extractedData!: any;

  @Column("text", { nullable: true })
  whatsappMessage!: string;

  @Column("text", { nullable: true })
  flyerHtml!: string;

  @Column({ nullable: true, unique: true })
  contentHash!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
