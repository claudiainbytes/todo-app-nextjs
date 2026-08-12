"use client";

import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type NavAction = "home" | "register" | "login" | "logout";

type NavItem = {
  label: string;
  action: NavAction;
};

type NavbarProps = {
  token: string | null;
  userLabel?: string;
  isMobile: boolean;
  mobileNavOpen: boolean;
  navItems: NavItem[];
  onOpenMobileNav: () => void;
  onCloseMobileNav: () => void;
  onNavAction: (action: NavAction) => void;
};

export function Navbar({
  token,
  userLabel,
  isMobile,
  mobileNavOpen,
  navItems,
  onOpenMobileNav,
  onCloseMobileNav,
  onNavAction,
}: NavbarProps) {
  const secondaryTextColor = "#334155";

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
              Todo Auth
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ color: secondaryTextColor }}>
                {token ? `Signed in as ${userLabel ?? "unknown user"}` : "Authenticate and continue"}
              </Box>
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton aria-label="open navigation menu" onClick={onOpenMobileNav}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  onClick={() => onNavAction(item.action)}
                  sx={{ color: "text.primary", textTransform: "none" }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={mobileNavOpen} onClose={onCloseMobileNav}>
        <Box sx={{ width: 280, p: 2.5 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Navigation
          </Typography>
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.label}
                onClick={() => onNavAction(item.action)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
