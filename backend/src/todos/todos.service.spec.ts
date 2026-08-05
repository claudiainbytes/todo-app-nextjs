import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let service: TodosService;
  const prisma = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const todo = {
    id: 'todo-id',
    name: 'Write tests',
    completed: true,
    createdAt: new Date('2026-07-30T12:00:00.000Z'),
    userId: 'user-id',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a todo for the authenticated user', async () => {
    prisma.todo.create.mockResolvedValue(todo);

    await expect(
      service.create('user-id', { name: 'Write tests', flag: true }),
    ).resolves.toEqual({
      id: 'todo-id',
      name: 'Write tests',
      flag: true,
      createdAt: todo.createdAt,
    });

    expect(prisma.todo.create).toHaveBeenCalledWith({
      data: {
        name: 'Write tests',
        completed: true,
        user: { connect: { id: 'user-id' } },
      },
    });
  });

  it('returns todos with the public flag field', async () => {
    prisma.todo.findMany.mockResolvedValue([todo]);

    await expect(service.findAll('user-id')).resolves.toEqual([
      {
        id: 'todo-id',
        name: 'Write tests',
        flag: true,
        createdAt: todo.createdAt,
      },
    ]);
  });
});
