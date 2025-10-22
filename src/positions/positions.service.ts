import { Injectable, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface CreatePositionDto {
  position_code: string;
  position_name: string;
}

@Injectable()
export class PositionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ✅ FIXED: no self-call here
  async getAllPositions() {
    const positions = await this.databaseService.query(
      'SELECT * FROM positions ORDER BY id ASC',
    );
    return positions;
  }

  async createPosition(createPositionDto: CreatePositionDto, userId: number): Promise<any> {
    const { position_code, position_name } = createPositionDto;
    console.log('position_code:', position_code);
    console.log('position_name:', position_name);
    console.log('userId:', userId);

    const existingRows = await this.databaseService.query(
      'SELECT * FROM positions WHERE position_code = ?',
      [position_code],
    );

    if (existingRows.length > 0) {
      throw new ForbiddenException(`Position code "${position_code}" already exists.`);
    }

    const result: any = await this.databaseService.query(
      `INSERT INTO positions (position_code, position_name, created_by) VALUES (?, ?, ?)`,
      [position_code, position_name, userId],
    );

    const newPositionRows = await this.databaseService.query(
      `SELECT * FROM positions WHERE id = ?`,
      [result.insertId],
    );

    return newPositionRows[0];
  }

  async deletePosition(positionId: string, userId: number): Promise<void> {
    const positionRows = await this.databaseService.query(
      'SELECT * FROM positions WHERE id = ?',
      [positionId],
    );

    if (positionRows.length === 0) {
      throw new NotFoundException(`Position with ID "${positionId}" not found`);
    }

    const position = positionRows[0];

    if (position.created_by !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this position');
    }

    await this.databaseService.query('DELETE FROM positions WHERE id = ?', [positionId]);
  }
}
