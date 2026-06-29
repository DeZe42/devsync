import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
}