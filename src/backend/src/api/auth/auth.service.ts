import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterInput, LoginInput, AuthPayload } from './dto/auth.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const existingUser = await this.usersService.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    
    const user = await this.usersService.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    const tokens = await this.generateTokens(user.id, user.email);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async refreshToken(refreshToken: string): Promise<AuthPayload> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async oauthLogin(provider: string, profile: any): Promise<AuthPayload> {
    let user = await this.usersService.findByEmail(profile.email);
    
    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
        name: profile.name,
        avatar: profile.picture,
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: 'refresh' },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
