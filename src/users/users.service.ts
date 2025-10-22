import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOne(username: string) {
    const [user] = await this.databaseService.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
    );
    return user || null;
  }

  async findById(id: number) {
    const [user] = await this.databaseService.query(
      'SELECT * FROM users WHERE id = ?',
      [id],
    );
    return user || null;
  }

  async createUser(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.databaseService.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
    );
    return { message: 'User created successfully' };
  }

  async setRefreshToken(userId: number, refreshToken: string | null) {
    await this.databaseService.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId],
    );
  }
}
