"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Container, Card, CardContent, Typography, useMediaQuery, useTheme } from "@mui/material";
import { authService, clearAuthToken, getApiErrorMessage, setAuthToken, type User } from "@/services/authService";
import { todoService, type Todo } from "@/services/todoService";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";
import { TodosPanel } from "@/components/todos-panel";

type Mode = "login" | "register";
type MessageType = "success" | "error";
type NavAction = "home" | "register" | "login" | "logout";

export default function Home() {
  const primaryTextColor = "#111827";
  const secondaryTextColor = "#334155";
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("success");
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

  const showMessage = (type: MessageType, text: string) => {
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

  const handleNavAction = (action: NavAction) => {
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
            <Typography sx={{ color: secondaryTextColor, fontWeight: 600 }}>Loading...</Typography>
            </CardContent>
          </Card>
        </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar
        token={token}
        userLabel={user?.name ?? user?.email}
        isMobile={isMobile}
        mobileNavOpen={mobileNavOpen}
        navItems={navItems}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobileNav={() => setMobileNavOpen(false)}
        onNavAction={handleNavAction}
      />

      <Container maxWidth={token ? "md" : "sm"} sx={{ py: { xs: 3, md: 6 } }}>
        {message ? (
          <Alert
            severity={messageType}
            variant="outlined"
            sx={{
              mb: 2,
              "& .MuiAlert-message": { color: primaryTextColor, fontWeight: 600 },
            }}
          >
            {message}
          </Alert>
        ) : null}

        {!token ? (
          <AuthForm
            mode={mode}
            email={email}
            name={name}
            password={password}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onModeChange={setMode}
            onEmailChange={setEmail}
            onNameChange={setName}
            onPasswordChange={setPassword}
          />
        ) : (
          <TodosPanel
            userEmail={user?.email}
            todos={todos}
            todoName={todoName}
            todoFlag={todoFlag}
            editingId={editingId}
            editingName={editingName}
            editingFlag={editingFlag}
            isSubmitting={isSubmitting}
            isTodosLoading={isTodosLoading}
            busyTodoId={busyTodoId}
            onLogout={() => void handleLogout()}
            onTodoNameChange={setTodoName}
            onTodoFlagChange={setTodoFlag}
            onCreateTodo={handleCreateTodo}
            onStartEdit={handleStartEdit}
            onEditingNameChange={setEditingName}
            onEditingFlagChange={setEditingFlag}
            onCancelEdit={() => setEditingId(null)}
            onUpdateTodo={(id) => void handleUpdateTodo(id)}
            onToggleTodo={(todo, flag) => void handleToggleTodo(todo, flag)}
            onDeleteTodo={(id) => void handleDeleteTodo(id)}
          />
        )}
      </Container>
    </Box>
  );
}
