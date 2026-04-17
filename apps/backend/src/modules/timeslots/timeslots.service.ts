import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateTimeSlotDto,
  TimeSlotResponseDto,
  UpdateTimeSlotDto,
} from '@monorepo/shared';

@Injectable()
export class TimeslotsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimeSlotDto): Promise<TimeSlotResponseDto> {
    await this.ensureSlotAvailability(dto.day, dto.hour);

    const timeSlot = await this.prisma.timeSlot.create({
      data: {
        day: dto.day,
        hour: dto.hour,
        available: dto.available ?? true,
        blockedBy: dto.blockedBy ?? null,
      },
    });

    return this.toResponse(timeSlot);
  }

  async findAll(): Promise<TimeSlotResponseDto[]> {
    const timeSlots = await this.prisma.timeSlot.findMany({
      orderBy: [{ day: 'asc' }, { hour: 'asc' }],
    });

    return timeSlots.map((timeSlot) => this.toResponse(timeSlot));
  }

  async findAvailable(): Promise<TimeSlotResponseDto[]> {
    const timeSlots = await this.prisma.timeSlot.findMany({
      where: {
        available: true,
        appointment: null,
      },
      orderBy: [{ day: 'asc' }, { hour: 'asc' }],
    });

    return timeSlots.map((timeSlot) => this.toResponse(timeSlot));
  }

  async findById(id: string): Promise<TimeSlotResponseDto> {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found.');
    }

    return this.toResponse(timeSlot);
  }

  async update(
    id: string,
    dto: UpdateTimeSlotDto,
  ): Promise<TimeSlotResponseDto> {
    const existingTimeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
    });

    if (!existingTimeSlot) {
      throw new NotFoundException('Time slot not found.');
    }

    const nextDay = dto.day ?? existingTimeSlot.day;
    const nextHour = dto.hour ?? existingTimeSlot.hour;

    if (nextDay !== existingTimeSlot.day || nextHour !== existingTimeSlot.hour) {
      await this.ensureSlotAvailability(nextDay, nextHour, id);
    }

    const timeSlot = await this.prisma.timeSlot.update({
      where: { id },
      data: {
        ...dto,
        blockedBy:
          dto.blockedBy === undefined ? existingTimeSlot.blockedBy : dto.blockedBy,
      },
    });

    return this.toResponse(timeSlot);
  }

  async block(id: string, reason: string): Promise<TimeSlotResponseDto> {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: { appointment: true },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found.');
    }

    if (timeSlot.appointment) {
      throw new ConflictException(
        'Cannot block a time slot that already has an appointment.',
      );
    }

    const updatedTimeSlot = await this.prisma.timeSlot.update({
      where: { id },
      data: {
        available: false,
        blockedBy: reason,
      },
    });

    return this.toResponse(updatedTimeSlot);
  }

  async unblock(id: string): Promise<TimeSlotResponseDto> {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found.');
    }

    const updatedTimeSlot = await this.prisma.timeSlot.update({
      where: { id },
      data: {
        available: true,
        blockedBy: null,
      },
    });

    return this.toResponse(updatedTimeSlot);
  }

  async delete(id: string): Promise<TimeSlotResponseDto> {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: { appointment: true },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found.');
    }

    if (timeSlot.appointment) {
      throw new ConflictException(
        'Cannot delete a time slot that already has an appointment.',
      );
    }

    const deletedTimeSlot = await this.prisma.timeSlot.delete({
      where: { id },
    });

    return this.toResponse(deletedTimeSlot);
  }

  private async ensureSlotAvailability(
    day: string,
    hour: string,
    ignoreId?: string,
  ): Promise<void> {
    const existingTimeSlot = await this.prisma.timeSlot.findFirst({
      where: {
        day,
        hour,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existingTimeSlot) {
      throw new ConflictException('A time slot already exists for this day and hour.');
    }
  }

  private toResponse(timeSlot: {
    id: string;
    day: string;
    hour: string;
    available: boolean;
    blockedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TimeSlotResponseDto {
    return {
      id: timeSlot.id,
      day: timeSlot.day,
      hour: timeSlot.hour,
      available: timeSlot.available,
      blockedBy: timeSlot.blockedBy ?? undefined,
      createdAt: timeSlot.createdAt,
      updatedAt: timeSlot.updatedAt,
    };
  }
}
