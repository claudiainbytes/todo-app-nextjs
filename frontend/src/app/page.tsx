"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  authService,
  clearAuthToken,
  getApiErrorMessage,
  setAuthToken,
  type User,
} from "@/services/authService";
import { todoService, type Todo } from "@/services/todoService";

export default function Home() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoName, setTodoName] = useState("");
  const [todoFlag, setTodoFlag] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingFlag, setEditingFlag] = useState(false);
  const [isTodosLoading, setIsTodosLoading] = useState(false);
  const [busyTodoId, setBusyTodoId] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setIsHydrated(true);

    const savedToken = window.localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      setAuthToken(savedToken);
      loadProfile(savedToken);
      loadTodos();
    }
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessageType(type);
    setMessage(text);
  };

  const loadProfile = async (authToken: string) => {
    try {
      const profile = await authService.getProfile(authToken);
      setUser(profile);
    } catch {
      expireSession();
    }
  };

  const loadTodos = async () => {
    setIsTodosLoading(true);
    try {
      setTodos(await todoService.list());
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to load todos"));
    } finally {
      setIsTodosLoading(false);
    }
  };

  const expireSession = () => {
    showMessage("error", "Session expired. Please login again.");
    localStorage.removeItem("auth_token");
    clearAuthToken();
    setToken(null);
    setUser(null);
    setTodos([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { accessToken, user: loggedUser } = await authService.login({ email, password });
        localStorage.setItem("auth_token", accessToken);
        setAuthToken(accessToken);
        setToken(accessToken);
        setUser(loggedUser);
        showMessage("success", "Login successful");
        await loadTodos();
      } else {
        await authService.register({ email, password, name });
        setMode("login");
        showMessage("success", "Registration successful. Please login.");
      }
    } catch (error) {
      showMessage("error", getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // The client still clears local auth state.
    } finally {
      localStorage.removeItem("auth_token");
      clearAuthToken();
      setToken(null);
      setUser(null);
      setTodos([]);
      setTodoName("");
      showMessage("success", "Logged out");
    }
  };

  const handleCreateTodo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!todoName.trim()) return;

    setIsSubmitting(true);
    try {
      const todo = await todoService.create({ name: todoName.trim(), flag: todoFlag });
      setTodos((current) => [todo, ...current]);
      setTodoName("");
      setTodoFlag(false);
      showMessage("success", "Todo created");
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to create todo"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingName(todo.name);
    setEditingFlag(todo.flag);
  };

  const handleUpdateTodo = async (id: string) => {
    if (!editingName.trim()) return;

    setBusyTodoId(id);
    try {
      const updated = await todoService.update(id, {
        name: editingName.trim(),
        flag: editingFlag,
      });
      setTodos((current) => current.map((todo) => (todo.id === id ? updated : todo)));
      setEditingId(null);
      showMessage("success", "Todo updated");
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to update todo"));
    } finally {
      setBusyTodoId(null);
    }
  };

  const handleToggleTodo = async (todo: Todo, flag: boolean) => {
    setBusyTodoId(todo.id);
    try {
      const updated = await todoService.update(todo.id, { flag });
      setTodos((current) => current.map((item) => (item.id === todo.id ? updated : item)));
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to update todo flag"));
    } finally {
      setBusyTodoId(null);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setBusyTodoId(id);
    try {
      await todoService.remove(id);
      setTodos((current) => current.filter((todo) => todo.id !== id));
      showMessage("success", "Todo deleted");
    } catch (error) {
      showMessage("error", getApiErrorMessage(error, "Unable to delete todo"));
    } finally {
      setBusyTodoId(null);
    }
  };

  const handleNavAction = (action: "home" | "register" | "login" | "logout") => {
    setMobileNavOpen(false);
    setMessage("");

    if (action === "home") {
      if (!token) setMode("login");
      return;
    }

    if (action === "register") {
      setMode("register");
      return;
    }

    if (action === "login") {
      setMode("login");
      return;
    }

    void handleLogout();
  };

  const shouldShowLogout = Boolean(token && mode !== "register");
  const navItems = [
    { label: "Home", action: "home" as const },
    ...(shouldShowLogout
      ? [{ label: "Logout", action: "logout" as const }]
      : [
          { label: "Register", action: "register" as const },
          { label: "Login", action: "login" as const },
        ]),
  ];

  if (!isHydrated) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">Loading...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Todo Auth
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {token ? `Signed in as ${user?.name ?? user?.email}` : "Authenticate and continue"}
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton aria-label="open navigation menu" onClick={() => setMobileNavOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {navItems.map((item) => (
                <Button key={item.label} color="inherit" onClick={() => handleNavAction(item.action)} sx={{ color: "text.primary", textTransform: "none" }}>
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        <Box sx={{ width: 280, p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Navigation
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItemButton key={item.label} onClick={() => handleNavAction(item.action)} sx={{ borderRadius: 2 }}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth={token ? "md" : "sm"} sx={{ py: { xs: 3, md: 6 } }}>
        {message ? (
          <Alert severity={messageType} variant="outlined" sx={{ mb: 2 }}>
            {message}
          </Alert>
        ) : null}

        {!token ? (
          <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "primary.main", color: "white" }}>
                  <LockOutlinedIcon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {mode === "login" ? "Welcome back" : "Create account"}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <Stack spacing={1.5}>
                    {mode === "register" ? <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} fullWidth /> : null}
                    <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth required />
                    <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth required />
                    <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 1 }}>
                      {isSubmitting ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
                    </Button>
                    <Button variant="text" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                      {mode === "login" ? "Need an account?" : "Already have an account?"}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Todos
                </Typography>
                <Typography color="text.secondary">{user?.email}</Typography>
              </Box>
              <Button variant="outlined" startIcon={<LogoutIcon />} onClick={() => void handleLogout()}>
                Logout
              </Button>
            </Stack>

            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
              <CardContent>
                <Box component="form" onSubmit={handleCreateTodo}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { xs: "stretch", sm: "center" } }}>
                    <TextField label="Todo name" value={todoName} onChange={(event) => setTodoName(event.target.value)} fullWidth required />
                    <Box sx={{ display: "flex", alignItems: "center", minWidth: 118 }}>
                      <Checkbox checked={todoFlag} onChange={(event) => setTodoFlag(event.target.checked)} slotProps={{ input: { "aria-label": "Todo flag" } }} />
                      <Typography>Flag</Typography>
                    </Box>
                    <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={isSubmitting || !todoName.trim()} sx={{ minWidth: 120 }}>
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
                  <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                    No todos yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {todos.map((todo) => {
                      const isEditing = editingId === todo.id;
                      const isBusy = busyTodoId === todo.id;

                      return (
                        <Box key={todo.id} sx={{ display: "grid", gridTemplateColumns: { xs: "auto 1fr", sm: "auto 1fr auto" }, gap: 1, alignItems: "center", p: 1, border: 1, borderColor: "divider", borderRadius: 2 }}>
                          <Checkbox
                            checked={isEditing ? editingFlag : todo.flag}
                            disabled={isBusy}
                            onChange={(event) => {
                              if (isEditing) {
                                setEditingFlag(event.target.checked);
                              } else {
                                void handleToggleTodo(todo, event.target.checked);
                              }
                            }}
                            slotProps={{ input: { "aria-label": `Flag ${todo.name}` } }}
                          />
                          {isEditing ? (
                            <TextField size="small" value={editingName} onChange={(event) => setEditingName(event.target.value)} fullWidth />
                          ) : (
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{todo.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Flag: {todo.flag ? "true" : "false"}
                              </Typography>
                            </Box>
                          )}
                          <Stack direction="row" spacing={0.5} sx={{ gridColumn: { xs: "1 / -1", sm: "auto" }, justifyContent: "flex-end" }}>
                            {isEditing ? (
                              <>
                                <Button size="small" onClick={() => setEditingId(null)} disabled={isBusy}>
                                  Cancel
                                </Button>
                                <IconButton aria-label="save todo" color="primary" disabled={isBusy || !editingName.trim()} onClick={() => void handleUpdateTodo(todo.id)}>
                                  <SaveOutlinedIcon />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton aria-label="edit todo" disabled={isBusy} onClick={() => handleStartEdit(todo)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton aria-label="delete todo" color="error" disabled={isBusy} onClick={() => void handleDeleteTodo(todo.id)}>
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
        )}
      </Container>
    </Box>
  );
}
