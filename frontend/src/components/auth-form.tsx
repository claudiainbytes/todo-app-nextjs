"use client";

import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

type AuthFormProps = {
  mode: "login" | "register";
  email: string;
  name: string;
  password: string;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onModeChange: (mode: "login" | "register") => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

export function AuthForm({
  mode,
  email,
  name,
  password,
  isSubmitting,
  onSubmit,
  onModeChange,
  onEmailChange,
  onNameChange,
  onPasswordChange,
}: AuthFormProps) {
  const secondaryTextColor = "#334155";

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ width: "100%" }}>
            <Stack spacing={1.5}>
              {mode === "register" ? (
                <TextField
                  label="Name"
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  fullWidth
                />
              ) : null}
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{ mt: 1 }}
              >
                {isSubmitting ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
              </Button>
              <Button
                variant="text"
                onClick={() => onModeChange(mode === "login" ? "register" : "login")}
                sx={{ color: secondaryTextColor, fontWeight: 700 }}
              >
                {mode === "login" ? "Need an account?" : "Already have an account?"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
