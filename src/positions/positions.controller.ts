import { Controller, Get, UseGuards, Req, Delete, Param, Post, Body } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface PositionPayload {
  userId: number;
  positionId: string;
}

interface CreatePositionDto {
  position_code: string;
  position_name: string;
}

@Controller('positions')
export class PositionsController {
  constructor(private positionsService: PositionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request & { user: PositionPayload }) {
    return { message: 'Protected route - Positions', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePosition(
    @Param('id') positionId: string,
    @Req() req: Request & { user: PositionPayload },
  ) {
    await this.positionsService.deletePosition(positionId, req.user.userId);
    return { message: `Position with ID ${positionId} deleted successfully.` };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPositions() {
    return this.positionsService.getAllPositions();
  }
  @Get()
  getAll() {
    return { message: 'Positions route works!' };
  }
  

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPosition(@Body() createPositionDto: CreatePositionDto, @Req() req: any) {
    console.log('Decoded JWT payload:', req.user);

    //FIX: use req.user.userId instead of req.user.sub
    const userId = req.user.userId;
    console.log('User ID:', userId);

    const { position_code, position_name } = createPositionDto;
    console.log('position_code:', position_code);
    console.log('position_name:', position_name);
    console.log('userId:', userId);

    const newPosition = await this.positionsService.createPosition(createPositionDto, userId);
    return { message: 'Position created successfully', position: newPosition };
  }
  @Get()
  async findAll() {
    return this.positionsService.getAllPositions();
  }
}
