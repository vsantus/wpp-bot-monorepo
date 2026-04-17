import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  BlockTimeSlotDto,
  CreateTimeSlotDto,
  TimeSlotResponseDto,
  UpdateTimeSlotDto,
} from '@monorepo/shared';
import { TimeslotsService } from './timeslots.service';

@Controller('timeslots')
export class TimeslotsController {
  constructor(private readonly timeslotsService: TimeslotsService) {}

  @Post()
  create(@Body() dto: CreateTimeSlotDto): Promise<TimeSlotResponseDto> {
    return this.timeslotsService.create(dto);
  }

  @Get()
  findAll(): Promise<TimeSlotResponseDto[]> {
    return this.timeslotsService.findAll();
  }

  @Get('available')
  findAvailable(): Promise<TimeSlotResponseDto[]> {
    return this.timeslotsService.findAvailable();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<TimeSlotResponseDto> {
    return this.timeslotsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTimeSlotDto,
  ): Promise<TimeSlotResponseDto> {
    return this.timeslotsService.update(id, dto);
  }

  @Patch(':id/block')
  block(
    @Param('id') id: string,
    @Body() dto: BlockTimeSlotDto,
  ): Promise<TimeSlotResponseDto> {
    return this.timeslotsService.block(id, dto.blockedBy);
  }

  @Patch(':id/unblock')
  unblock(@Param('id') id: string): Promise<TimeSlotResponseDto> {
    return this.timeslotsService.unblock(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<TimeSlotResponseDto> {
    return this.timeslotsService.delete(id);
  }
}
