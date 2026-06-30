import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('seed-admin')
  async seedAdmin(@Body() body: { email: string; password: string }) {
    // A valós életben itt DTO-t (Data Transfer Object) használnánk validációval,
    // de egy belső seederhez ez a gyors megoldás is tökéletes.
    const user = await this.authService.createAdminUser(body.email, body.password);
    
    // Biztonság: Sose küldjük vissza a lehashelt jelszót a frontendnek!
    return {
      id: user.id,
      email: user.email,
    }; 
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // 1. Validáljuk az e-mailt és a jelszót
    const user = await this.authService.validateUser(body.email, body.password);
    
    if (!user) {
      throw new UnauthorizedException('Hibás e-mail vagy jelszó!');
    }

    // 2. Kiadjuk a tokent
    return this.authService.login(user);
  }
}