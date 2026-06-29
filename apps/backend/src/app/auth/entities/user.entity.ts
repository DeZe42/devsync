import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true }) // Fontos: Két ember nem regisztrálhat ugyanazzal az e-maillel!
  email!: string;

  @Column()
  passwordHash!: string;

  // A TypeORM "Hook"-ja (Eseményfigyelője)
  @BeforeInsert()
  async hashPassword() {
    if (this.passwordHash) {
      // 10 "sózási kör" (Salt Rounds) az iparági standard. 
      // Elég lassú ahhoz, hogy megizzassza a hekkerek gépeit, de elég gyors, hogy a user ne vegye észre.
      const saltRounds = 10;
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    }
  }
}