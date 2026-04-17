import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AppointmentResponseDto,
  CreateAppointmentDto,
  RescheduleAppointmentDto,
  UserResponseDto,
} from '@monorepo/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(dto);
  }

  @Get()
  findAll(): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyAppointments(
    @CurrentUser() user: UserResponseDto,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findByClient(user.id);
  }

  @Get('client/:clientId')
  findByClient(
    @Param('clientId') clientId: string,
  ): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findByClient(clientId);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findById(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancel(id);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.reschedule(id, dto.newTimeSlotId);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.delete(id);
  }
}
