import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user?: { sub: string; email: string };
}

describe('TodosController', () => {
  let controller: TodosController;
  const todosService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };
  const req = { user: { sub: 'user-id', email: 'user@example.com' } } as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: todosService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates todos for the authenticated user', () => {
    const dto = { name: 'Ship UI', flag: false };
    controller.create(req, dto);

    expect(todosService.create).toHaveBeenCalledWith('user-id', dto);
  });

  it('lists todos for the authenticated user', () => {
    controller.findAll(req);

    expect(todosService.findAll).toHaveBeenCalledWith('user-id');
  });
});
