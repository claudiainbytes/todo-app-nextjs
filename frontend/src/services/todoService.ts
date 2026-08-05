import { api } from "@/services/authService";

export type Todo = {
  id: string;
  name: string;
  flag: boolean;
  createdAt: string;
};

type TodoPayload = {
  name: string;
  flag?: boolean;
};

export const todoService = {
  list: async () => {
    const response = await api.get<Todo[]>("/todos");
    return response.data;
  },

  create: async (payload: TodoPayload) => {
    const response = await api.post<Todo>("/todos", payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<TodoPayload>) => {
    const response = await api.patch<Todo>(`/todos/${id}`, payload);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/todos/${id}`);
    return response.data;
  },
};
