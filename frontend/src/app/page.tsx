"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

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
      setToken(null);
      setUser(null);
      setMessageType("success");
      setMessage("Logged out");
    }
  };

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
                <Button variant="outlined" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
