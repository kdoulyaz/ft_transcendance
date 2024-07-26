// import { Strategy } from 'passport-google-oauth20';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { AuthService } from '../auth.service';
// // import { UserEntity } from 'src/user/entities/user.entity';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(private authService: AuthService) {
//     super({
//       clientID: process.env.CLI_ID,
//       clientSecret: process.env.CLI_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     });
//   }

//   async validate(accessToken: string, refreshToken: string, profile: any): Promise<User> {
//     const user = await this.authService.validateUser(profile);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }
