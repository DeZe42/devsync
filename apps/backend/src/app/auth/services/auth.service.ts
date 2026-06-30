import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService, // <-- Injektáljuk az új token-gyártó gépünket
  ) {}

  async createAdminUser(email: string, plainTextPassword: string): Promise<UserEntity> {
    // Ellenőrizzük, hogy van-e már ilyen user
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Ez az e-mail cím már foglalt!');
    }

    // Példányosítjuk az Entity-t. Amikor a .save() lefut, beindul a @BeforeInsert varázslatunk.
    const newUser = this.userRepository.create({
      email,
      passwordHash: plainTextPassword, // Itt még nyers, de a @BeforeInsert átalakítja!
    });

    return this.userRepository.save(newUser);
  }

  // 1. Lépés: Jelszó ellenőrzése
  async validateUser(email: string, pass: string): Promise<{ id: number; email: string } | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // Siker! A bcrypt megerősítette a hash-t.
      // Leszedjük a jelszót, mielőtt visszaadjuk
      return {
        id: user.id,
        email: user.email,
      };
    }
    // Ha nem létezik a user, vagy rossz a jelszó:
    return null;
  }

  // 2. Lépés: Token kiállítása a validált usernek
  async login(user: { id: number; email: string }): Promise<{ access_token: string }> {
    // Ezt tesszük bele a karszalagba (Payload). Itt a 'sub' (subject) az iparági standard az ID-ra.
    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}