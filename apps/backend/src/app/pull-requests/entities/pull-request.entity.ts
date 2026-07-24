import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { PullRequest, PRStatus } from '@devsync/shared-types';

@Entity('pull_requests') // Megmondjuk, mi legyen a tábla pontos neve a Postgres-ben
export class PullRequestEntity implements PullRequest {
  
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  githubPrNumber!: number;

  @Column({ type: 'varchar', length: 255 })
  author!: string;

  @Column({ type: 'varchar', length: 50, default: 'OPEN' })
  status!: PRStatus;

  @Column({ type: 'int', default: 0 })
  leadTime!: number;

  // --- SENIOR BÓNUSZ ---
  // Egy igazi rendszerben mindig tudnunk kell, mikor jött létre és mikor frissült egy rekord.
  // Ezt a TypeORM automatikusan kezeli nekünk, ha ezeket a dekorátorokat használjuk!
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  mergedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  openedAt!: Date | null;
}