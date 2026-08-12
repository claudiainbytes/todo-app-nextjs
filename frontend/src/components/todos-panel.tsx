"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import type { Todo } from "@/services/todoService";

type TodosPanelProps = {
  userEmail?: string;
  todos: Todo[];
  todoName: string;
  todoFlag: boolean;
  editingId: string | null;
  editingName: string;
  editingFlag: boolean;
  isSubmitting: boolean;
  isTodosLoading: boolean;
  busyTodoId: string | null;
  onLogout: () => void;
  onTodoNameChange: (value: string) => void;
  onTodoFlagChange: (value: boolean) => void;
  onCreateTodo: (event: React.FormEvent) => void;
  onStartEdit: (todo: Todo) => void;
  onEditingNameChange: (value: string) => void;
  onEditingFlagChange: (value: boolean) => void;
  onCancelEdit: () => void;
  onUpdateTodo: (id: string) => void;
  onToggleTodo: (todo: Todo, flag: boolean) => void;
  onDeleteTodo: (id: string) => void;
};

export function TodosPanel({
  userEmail,
  todos,
  todoName,
  todoFlag,
  editingId,
  editingName,
  editingFlag,
  isSubmitting,
  isTodosLoading,
  busyTodoId,
  onLogout,
  onTodoNameChange,
  onTodoFlagChange,
  onCreateTodo,
  onStartEdit,
  onEditingNameChange,
  onEditingFlagChange,
  onCancelEdit,
  onUpdateTodo,
  onToggleTodo,
  onDeleteTodo,
}: TodosPanelProps) {
  const primaryTextColor = "#111827";
  const secondaryTextColor = "#334155";

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: primaryTextColor }}>
            Todos
          </Typography>
          <Typography sx={{ color: secondaryTextColor, fontWeight: 500 }}>{userEmail}</Typography>
        </Box>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={onLogout}>
          Logout
        </Button>
      </Stack>

      <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
        <CardContent>
          <Box component="form" onSubmit={onCreateTodo}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <TextField
                label="Todo name"
                value={todoName}
                onChange={(event) => onTodoNameChange(event.target.value)}
                fullWidth
                required
              />
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 118 }}>
                <Checkbox
                  checked={todoFlag}
                  onChange={(event) => onTodoFlagChange(event.target.checked)}
                  slotProps={{ input: { "aria-label": "Todo flag" } }}
                />
                <Typography>Flag</Typography>
              </Box>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                disabled={isSubmitting || !todoName.trim()}
                sx={{ minWidth: 120 }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          {isTodosLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 5 }}>
              <CircularProgress size={28} />
            </Box>
          ) : todos.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: "center", color: secondaryTextColor, fontWeight: 500 }}>
              No todos yet.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {todos.map((todo) => {
                const isEditing = editingId === todo.id;
                const isBusy = busyTodoId === todo.id;

                return (
                  <Box
                    key={todo.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "auto 1fr", sm: "auto 1fr auto" },
                      gap: 1,
                      alignItems: "center",
                      p: 1,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Checkbox
                      checked={isEditing ? editingFlag : todo.flag}
                      disabled={isBusy}
                      onChange={(event) => {
                        if (isEditing) {
                          onEditingFlagChange(event.target.checked);
                        } else {
                          onToggleTodo(todo, event.target.checked);
                        }
                      }}
                      slotProps={{ input: { "aria-label": `Flag ${todo.name}` } }}
                    />
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={editingName}
                        onChange={(event) => onEditingNameChange(event.target.value)}
                        fullWidth
                      />
                    ) : (
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: primaryTextColor, overflowWrap: "anywhere" }}>
                          {todo.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: secondaryTextColor, fontWeight: 600 }}>
                          Flag: {todo.flag ? "true" : "false"}
                        </Typography>
                      </Box>
                    )}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ gridColumn: { xs: "1 / -1", sm: "auto" }, justifyContent: "flex-end" }}
                    >
                      {isEditing ? (
                        <>
                          <Button size="small" onClick={onCancelEdit} disabled={isBusy}>
                            Cancel
                          </Button>
                          <IconButton
                            aria-label="save todo"
                            color="primary"
                            disabled={isBusy || !editingName.trim()}
                            onClick={() => onUpdateTodo(todo.id)}
                          >
                            <SaveOutlinedIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton aria-label="edit todo" disabled={isBusy} onClick={() => onStartEdit(todo)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label="delete todo"
                            color="error"
                            disabled={isBusy}
                            onClick={() => onDeleteTodo(todo.id)}
                          >
                            <DeleteOutlinedIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
