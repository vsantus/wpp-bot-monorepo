import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  AppointmentResponseDto,
  AppointmentStatus,
  CreateAppointmentDto,
} from '@monorepo/shared';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const client = await this.prisma.user.findUnique({
      where: { id: dto.clientId },
      select: { id: true, name: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found.');
    }

    const timeSlot = await this.validateAvailableTimeSlot(dto.timeSlotId);

    const appointment = await this.prisma.$transaction(async (tx) => {
      const createdAppointment = await tx.appointment.create({
        data: {
          clientId: dto.clientId,
          timeSlotId: dto.timeSlotId,
          service: dto.service,
          paymentMethod: dto.paymentMethod,
          notes: dto.notes ?? null,
        },
        include: {
          client: true,
          timeSlot: true,
        },
      });

      await tx.timeSlot.update({
        where: { id: dto.timeSlotId },
        data: {
          available: false,
          blockedBy: null,
        },
      });

      return createdAppointment;
    });

    return this.toResponse({
      ...appointment,
      client,
      timeSlot,
    });
  }

  async findAll(): Promise<AppointmentResponseDto[]> {
    const appointments = await this.prisma.appointment.findMany({
      include: {
        client: true,
        timeSlot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return appointments.map((appointment) => this.toResponse(appointment));
  }

  async findByClient(clientId: string): Promise<AppointmentResponseDto[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { clientId },
      include: {
        client: true,
        timeSlot: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return appointments.map((appointment) => this.toResponse(appointment));
  }

  async findById(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        timeSlot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    return this.toResponse(appointment);
  }

  async cancel(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        timeSlot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.status === Status.CANCELADO) {
      throw new BadRequestException('Appointment is already canceled.');
    }

    const updatedAppointment = await this.prisma.$transaction(async (tx) => {
      const canceledAppointment = await tx.appointment.update({
        where: { id },
        data: { status: Status.CANCELADO },
        include: {
          client: true,
          timeSlot: true,
        },
      });

      await tx.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: {
          available: true,
          blockedBy: null,
        },
      });

      return canceledAppointment;
    });

    return this.toResponse(updatedAppointment);
  }

  async reschedule(
    id: string,
    newTimeSlotId: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        timeSlot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.status === Status.CANCELADO) {
      throw new BadRequestException('Canceled appointments cannot be rescheduled.');
    }

    if (appointment.timeSlotId === newTimeSlotId) {
      throw new BadRequestException('The new time slot must be different.');
    }

    await this.validateAvailableTimeSlot(newTimeSlotId);

    const updatedAppointment = await this.prisma.$transaction(async (tx) => {
      await tx.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: {
          available: true,
          blockedBy: null,
        },
      });

      await tx.timeSlot.update({
        where: { id: newTimeSlotId },
        data: {
          available: false,
          blockedBy: null,
        },
      });

      return tx.appointment.update({
        where: { id },
        data: { timeSlotId: newTimeSlotId },
        include: {
          client: true,
          timeSlot: true,
        },
      });
    });

    return this.toResponse(updatedAppointment);
  }

  async delete(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        timeSlot: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    const deletedAppointment = await this.prisma.$transaction(async (tx) => {
      const removedAppointment = await tx.appointment.delete({
        where: { id },
        include: {
          client: true,
          timeSlot: true,
        },
      });

      await tx.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: {
          available: true,
          blockedBy: null,
        },
      });

      return removedAppointment;
    });

    return this.toResponse(deletedAppointment);
  }

  private async validateAvailableTimeSlot(timeSlotId: string) {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { appointment: true },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found.');
    }

    if (!timeSlot.available || timeSlot.blockedBy || timeSlot.appointment) {
      throw new BadRequestException('Time slot is not available.');
    }

    return timeSlot;
  }

  private toResponse(appointment: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    clientId: string;
    timeSlotId: string;
    service: string;
    status: Status;
    paymentMethod: string;
    notes: string | null;
    client?: { name: string } | null;
    timeSlot?: { day: string; hour: string } | null;
  }): AppointmentResponseDto {
    return {
      id: appointment.id,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      clientId: appointment.clientId,
      clientName: appointment.client?.name,
      timeSlotId: appointment.timeSlotId,
      day: appointment.timeSlot?.day,
      hour: appointment.timeSlot?.hour,
      service: appointment.service,
      status: appointment.status as AppointmentStatus,
      paymentMethod: appointment.paymentMethod as AppointmentResponseDto['paymentMethod'],
      notes: appointment.notes ?? undefined,
    };
  }
}
