import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

import bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (
  password: string,
  hashValue: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashValue);
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const passwordHash = await hashPassword(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name ?? null,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      return {
        message: 'User registered successfully',
        user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (this.isDatabaseConnectionError(error)) {
        throw new BadRequestException(
          'Unable to connect to the database. Check the MongoDB URL and database name.',
        );
      }

      throw new BadRequestException('Unable to create the user right now.');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatches = await comparePassword(
        dto.password,
        user.passwordHash,
      );

      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email };

      return {
        accessToken: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (this.isDatabaseConnectionError(error)) {
        throw new BadRequestException(
          'Unable to connect to the database. Check the MongoDB URL and database name.',
        );
      }

      throw new BadRequestException('Unable to log in right now.');
    }
  }

  logout(user: { sub?: string }) {
    return {
      message: 'Logged out successfully',
      userId: user?.sub ?? null,
    };
  }

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (this.isDatabaseConnectionError(error)) {
        throw new BadRequestException(
          'Unable to connect to the database. Check the MongoDB URL and database name.',
        );
      }

      throw new BadRequestException('Unable to load the profile right now.');
    }
  }

  async healthCheck() {
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      return {
        status: 'ok',
        message: 'MongoDB connection is working.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: this.getDatabaseErrorMessage(error),
      };
    }
  }

  private isDatabaseConnectionError(error: unknown): boolean {
    const message = this.getDatabaseErrorMessage(error);
    return (
      message.includes('empty database name') ||
      message.includes('MONGODB_URI') ||
      message.includes('database name') ||
      message.includes('ENOTFOUND') ||
      message.includes('ECONNREFUSED')
    );
  }

  private getDatabaseErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
