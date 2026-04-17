import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuthResponseDto, LoginDto, RegisterDto, UserResponseDto } from '@monorepo/shared';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

type SafeUser = {
  id: string;
  name: string;
  contact: string;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { contact: dto.contact },
    });

    if (existingUser) {
      throw new ConflictException('A user with this contact already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        contact: dto.contact,
        passwordHash: this.hashPassword(dto.password),
        phone: dto.phone ?? null,
        email: dto.email ?? null,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { contact: dto.contact },
    });

    if (
      !user ||
      !user.passwordHash ||
      !this.verifyPassword(dto.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.buildAuthResponse(user);
  }

  async validateUser(userId: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return this.toSafeUser(user);
  }

  private buildAuthResponse(
    user: SafeUser & { passwordHash?: string | null },
  ): AuthResponseDto {
    const safeUser = this.toSafeUser(user);

    return {
      accessToken: this.jwtService.sign({
        sub: safeUser.id,
        contact: safeUser.contact,
      }),
      user: this.toResponse(safeUser),
    };
  }

  private toSafeUser(user: SafeUser & { passwordHash?: string | null }): SafeUser {
    return {
      id: user.id,
      name: user.name,
      contact: user.contact,
      phone: user.phone,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toResponse(user: SafeUser): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      contact: user.contact,
      phone: user.phone ?? undefined,
      email: user.email ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(`${salt}:${password}`)
      .digest('hex');

    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, originalHash] = storedHash.split(':');

    if (!salt || !originalHash) {
      return false;
    }

    const calculatedHash = createHash('sha256')
      .update(`${salt}:${password}`)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(originalHash, 'hex'),
      Buffer.from(calculatedHash, 'hex'),
    );
  }
}
