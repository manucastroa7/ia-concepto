import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class DestinationAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  destination: string; // The name of the destination (lowercase/trimmed)

  @Column()
  imageUrl: string; // The Cloudinary URL

  @Column({ nullable: true })
  publicId: string; // Cloudinary public ID for deletions/updates

  @Column({ type: "varchar", nullable: true })
  hotelName: string | null; // Optional hotel assignment memory

  @Column({ default: true })
  isDefault: boolean; // Whether this is the preferred image for this destination

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
