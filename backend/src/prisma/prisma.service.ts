import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
@Injectable()
export class PrismaService {
    constructor(private readonly prisma: PrismaClient) {}
}
    