import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      expiresIn: '7d',
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashedRefreshToken);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async register(username: string, password: string) {
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) throw new UnauthorizedException('Username already exists');
    return this.usersService.createUser(username, password);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret',
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refresh_token) throw new UnauthorizedException();
      const match = await bcrypt.compare(refreshToken, user.refresh_token);
      if (!match) throw new UnauthorizedException();
      const newAccessToken = this.jwtService.sign({
        username: user.username,
        sub: user.id,
      });
      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}


