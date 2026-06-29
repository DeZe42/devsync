import { Controller, Post, Body } from '@nestjs/common';
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
}