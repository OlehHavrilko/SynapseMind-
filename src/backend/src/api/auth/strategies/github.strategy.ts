import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('oauth.github.clientId'),
      clientSecret: configService.get('oauth.github.clientSecret'),
      callbackURL: 'http://localhost:4000/api/v1/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile.emails?.[0]?.value || `${profile.id}@github.com`;
    const user = await this.authService.oauthLogin('github', {
      email,
      name: profile.displayName || profile.username,
      picture: profile.photos?.[0]?.value,
    });
    done(null, user);
  }
}
