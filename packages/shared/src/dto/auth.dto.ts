import { UserResponseDto } from './user.dto';

export class RegisterDto {
  name: string;
  contact: string;
  password: string;
  phone?: string;
  email?: string;
}

export class LoginDto {
  contact: string;
  password: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
