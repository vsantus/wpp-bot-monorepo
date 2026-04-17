// Request DTOs
export class CreateTimeSlotDto {
    day: string; // Format: "10/03" (DD/MM)
    hour: string; // Format: "14:00" (HH:MM)
    available?: boolean;
    blockedBy?: string;
}

export class UpdateTimeSlotDto {
    day?: string;
    hour?: string;
    available?: boolean;
    blockedBy?: string;
}

export class BlockTimeSlotDto {
    blockedBy: string; // Reason for blocking
}

export class UnblockTimeSlotDto {
    // Just need to unblock
}

// Response DTO
export class TimeSlotResponseDto {
    id: string;
    day: string;
    hour: string;
    available: boolean;
    blockedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Pagination/List Response
export class AvailableTimeSlotsResponseDto {
    data: TimeSlotResponseDto[];
    total: number;
}
