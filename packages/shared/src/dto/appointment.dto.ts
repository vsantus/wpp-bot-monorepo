import { AppointmentStatus, PaymentMethod } from '../enums';

// Request DTOs
export class CreateAppointmentDto {
  clientId: string;
  timeSlotId: string;
  service: string; // "Corte", "Corte + Barba", etc
  paymentMethod: PaymentMethod;
  notes?: string;
}

export class UpdateAppointmentDto {
  service?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export class RescheduleAppointmentDto {
  newTimeSlotId: string;
}

export class CancelAppointmentDto {
  reason?: string;
}

// Response DTO
export class AppointmentResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  clientName?: string; // Include client name in response
  timeSlotId: string;
  day?: string; // Include time slot info
  hour?: string;
  service: string;
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// List Response
export class AppointmentsListResponseDto {
  data: AppointmentResponseDto[];
  total: number;
}
