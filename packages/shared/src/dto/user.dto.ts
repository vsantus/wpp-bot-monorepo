// Request DTOs
export class CreateUserDto {
  name: string;
  contact: string; // WhatsApp number or email
  phone?: string;
  email?: string;
}

export class UpdateUserDto {
  name?: string;
  phone?: string;
  email?: string;
}

// Response DTO
export class UserResponseDto {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
