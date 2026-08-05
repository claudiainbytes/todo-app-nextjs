import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Todo } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        name: createTodoDto.name,
        completed: createTodoDto.flag ?? false,
        user: { connect: { id: userId } },
      },
    });

    return this.toResponse(todo);
  }

  async findAll(userId: string) {
    const todos = await this.prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return todos.map((todo) => this.toResponse(todo));
  }

  async findOne(userId: string, id: string) {
    const todo = await this.prisma.todo.findFirst({
      where: { id, userId },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return this.toResponse(todo);
  }

  async update(userId: string, id: string, updateTodoDto: UpdateTodoDto) {
    await this.ensureTodoExists(userId, id);

    const data: { name?: string; completed?: boolean } = {};

    if (updateTodoDto.name !== undefined) {
      data.name = updateTodoDto.name;
    }

    if (updateTodoDto.flag !== undefined) {
      data.completed = updateTodoDto.flag;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Provide a todo name or flag to update');
    }

    const todo = await this.prisma.todo.update({
      where: { id },
      data,
    });

    return this.toResponse(todo);
  }

  async remove(userId: string, id: string) {
    await this.ensureTodoExists(userId, id);
    await this.prisma.todo.delete({ where: { id } });

    return { message: 'Todo deleted successfully' };
  }

  private async ensureTodoExists(userId: string, id: string) {
    const todo = await this.prisma.todo.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
  }

  private toResponse(todo: Todo) {
    return {
      id: todo.id,
      name: todo.name,
      flag: todo.completed,
      createdAt: todo.createdAt,
    };
  }
}
