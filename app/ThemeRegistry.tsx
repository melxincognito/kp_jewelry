"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from "@emotion/cache";
import LinkBehaviour from "@/components/ui/LinkBehaviour";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7a5c10",
      light: "#c9a84c",
      dark: "#4a380a",
      contrastText: "#fdfbf8",
    },
    secondary: {
      main: "#7a7470",
      contrastText: "#1a1714",
    },
    error: { main: "#b91c1c" },
    success: { main: "#059669" },
    warning: { main: "#d97706" },
    background: {
      default: "#f7f4ef",
      paper: "#fdfbf8",
    },
    text: {
      primary: "#1a1714",
      secondary: "#7a7470",
    },
    divider: "#ddd6cc",
  },
  typography: {
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  shape: { borderRadius: 2 },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehaviour,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehaviour,
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.75rem",
          fontWeight: 500,
          borderRadius: 2,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none", border: "1px solid #ddd6cc" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: "1px solid #ddd6cc", borderRadius: 2 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: "#fdfbf8",
          fontSize: "0.875rem",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#7a5c10" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#7a5c10",
            borderWidth: 1,
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "#b91c1c" },
        },
        notchedOutline: { borderColor: "#ddd6cc" },
        input: {
          padding: "10px 12px",
          "&::placeholder": { color: "#7a7470", opacity: 0.5 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#7a7470", fontSize: "0.875rem", fontWeight: 500 },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { marginLeft: 0, fontSize: "0.75rem" },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { padding: "10px 12px", fontSize: "0.875rem" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: "1px solid #ddd6cc",
          borderRadius: 2,
          backgroundColor: "#fdfbf8",
        },
        backdrop: { backgroundColor: "rgba(0,0,0,0.7)" },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          fontWeight: 600,
          borderBottom: "1px solid #ddd6cc",
          padding: "16px 24px",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: { padding: "20px 24px" },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: "12px 24px 16px", borderTop: "1px solid #ddd6cc" },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { border: "1px solid #ddd6cc", borderRadius: 2 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            color: "rgba(122,116,112,0.6)",
            fontSize: "0.65rem",
            fontWeight: 400,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderBottom: "1px solid #ddd6cc",
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root:last-child .MuiTableCell-root": {
            borderBottom: 0,
          },
          "& .MuiTableRow-root:hover": {
            backgroundColor: "rgba(0,0,0,0.01)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(221,214,204,0.5)",
          fontSize: "0.875rem",
          color: "#1a1714",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 2, height: "auto", fontSize: "0.75rem" },
        label: { padding: "2px 8px" },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#f7f4ef", color: "#1a1714" },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: "none", borderRight: "1px solid #ddd6cc" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(247,244,239,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #ddd6cc",
          color: "#1a1714",
          boxShadow: "none",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          "&.Mui-selected": {
            backgroundColor: "rgba(122,92,16,0.08)",
            color: "#7a5c10",
            "&:hover": { backgroundColor: "rgba(122,92,16,0.12)" },
          },
          "&:hover": { backgroundColor: "rgba(0,0,0,0.03)" },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": { color: "#7a5c10" },
          "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#7a5c10" },
        },
      },
    },
  },
});

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "css" });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
