import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // 1. Honnan vegye a tokent? A HTTP kérések "Authorization: Bearer <token>" fejlécéből.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Ha lejárt az 1 óra, könyörtelenül dobja el a kérést.
      ignoreExpiration: false,
      // 3. Ezzel a pecséttel (kulccsal) ellenőrzi, hogy mi állítottuk-e ki a tokent.
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Ez a metódus CSAK akkor fut le, ha a token érvényes és a pecsét stimmel!
  async validate(payload: { sub: number; email: string }) {
    // A JWT payloadjából (amit a login-nál összeraktunk) kivesszük az adatokat.
    // Amit itt visszatérünk, azt a NestJS automatikusan ráteszi a 'request.user' objektumra, 
    // így a Controllerekben mindig tudni fogjuk, pontosan ki hívta meg a végpontot.
    return { userId: payload.sub, email: payload.email };
  }
}