import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Ez egy beépített NestJS/Passport osztály, mi csak adunk neki egy szép nevet.
// A 'jwt' paraméter köti össze az előbb megírt JwtStrategy-vel.
export class JwtAuthGuard extends AuthGuard('jwt') {}