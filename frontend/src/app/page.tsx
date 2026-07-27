"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MenuIcon from "@mui/icons-material/Menu";

type User = {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
};

const api = axios.create({ baseURL: "http://localhost:4000" });

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setIsHydrated(true);

    const savedToken = window.localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
      loadProfile(savedToken);
    }
  }, []);

  const loadProfile = async (authToken: string) => {
    try {
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
    } catch {
      setMessageType("error");
      setMessage("Session expired. Please login again.");
      localStorage.removeItem("auth_token");
      setToken(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email, password } : { email, password, name };
      const response = await api.post(endpoint, payload);

      if (mode === "login") {
        const authToken = response.data.accessToken;
        localStorage.setItem("auth_token", authToken);
        api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
        setToken(authToken);
        setUser(response.data.user);
        setMessageType("success");
        setMessage("Login successful");
      } else {
        setMode("login");
        setMessageType("success");
        setMessage("Registration successful. Please login.");
      }
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message ?? error?.message ?? "Operation failed";
      setMessageType("error");
      setMessage(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common.Authorization;
      setToken(null);
      setUser(null);
      setMessageType("success");
      setMessage("Logged out");
    }
  };

  const handleNavAction = (action: "home" | "register" | "login" | "logout") => {
    setMobileNavOpen(false);
    setMessage("");

    if (action === "home") {
      if (!token) {
        setMode("login");
      }
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
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Todo Auth
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {token ? `Signed in as ${user?.name ?? user?.email}` : "Authenticate and continue"}
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton
              aria-label="open navigation menu"
              color="inherit"
              onClick={() => setMobileNavOpen(true)}
              sx={{ color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  onClick={() => handleNavAction(item.action)}
                  sx={{
                    color: "text.primary",
                    borderRadius: 999,
                    px: 2,
                    textTransform: "none",
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
        <Box sx={{ width: 280, p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
            Navigation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {token ? "Quick actions for your account" : "Move between auth screens"}
          </Typography>
          <List>
            <ListItemButton onClick={() => handleNavAction("home")} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Home" />
            </ListItemButton>
            {!shouldShowLogout ? (
              <>
                <ListItemButton onClick={() => handleNavAction("register")} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Register" />
                </ListItemButton>
                <ListItemButton onClick={() => handleNavAction("login")} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </>
            ) : (
              <ListItemButton onClick={() => handleNavAction("logout")} sx={{ borderRadius: 2 }}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            )}
          </List>
          {token ? (
            <Card variant="outlined" sx={{ mt: 2, borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.name ?? "Authenticated user"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </CardContent>
            </Card>
          ) : null}
        </Box>
      </Drawer>

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "white",
                }}
              >
                <LockOutlinedIcon />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {token ? "Your account" : mode === "login" ? "Welcome back" : "Create account"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                {token ? "You are signed in securely." : "Sign in or create an account to continue."}
              </Typography>

              {message ? (
                <Typography color={messageType === "error" ? "error" : "primary"} variant="body2">
                  {message}
                </Typography>
              ) : null}

              {!token ? (
                <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {mode === "register" ? (
                      <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                      />
                    ) : null}
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                    />
                    <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 1 }}>
                      {isSubmitting ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                      sx={{ mt: 0.5 }}
                    >
                      {mode === "login" ? "Need an account?" : "Already have an account?"}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                  <Typography variant="body1">
                    Welcome, {user?.name ?? user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {user?.email}
                  </Typography>
                  <Button variant="outlined" onClick={() => void handleLogout()}>
                    Logout
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
