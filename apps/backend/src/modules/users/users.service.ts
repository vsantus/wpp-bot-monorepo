import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@monorepo/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { contact: dto.contact },
    });

    if (existingUser) {
      throw new ConflictException('A user with this contact already exists.');
    }

    const user = await this.prisma.user.create({
      data: dto,
    });

    return this.toResponse(user);
  }

  async findByContact(contact: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { contact },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.toResponse(user);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.ensureExists(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return this.toResponse(user);
  }

  async delete(id: string): Promise<UserResponseDto> {
    await this.ensureExists(id);

    const user = await this.prisma.user.delete({
      where: { id },
    });

    return this.toResponse(user);
  }

  private async ensureExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }
  }

  private toResponse(user: {
    id: string;
    name: string;
    contact: string;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
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
}
