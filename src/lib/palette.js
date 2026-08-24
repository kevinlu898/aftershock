export const TOKEN_NAMES = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "border",
  "input",
  "ring",
  "destructive",
  "destructiveForeground",
  "warning",
  "shadowColor",
];

export function cssVarName(token) {
  return `--${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

export const PALETTES = {
  light: {
    background: "#F3F8F4",
    foreground: "#17201C",
    card: "#FFFFFF",
    cardForeground: "#17201C",
    popover: "#FFFFFF",
    popoverForeground: "#17201C",
    primary: "#25745A",
    primaryForeground: "#FFFFFF",
    secondary: "#E7F0E9",
    secondaryForeground: "#193C32",
    muted: "#E7F0E9",
    mutedForeground: "#5D786C",
    accent: "#E7F0E9",
    accentForeground: "#193C32",
    border: "#D9E5DC",
    input: "#D9E5DC",
    ring: "#25745A",
    destructive: "#C93232",
    destructiveForeground: "#FFFFFF",
    warning: "#B96B13",
    shadowColor: "#17201C",
  },
  dark: {
    background: "#0D1713",
    foreground: "#EDF5F0",
    card: "#14231D",
    cardForeground: "#EDF5F0",
    popover: "#14231D",
    popoverForeground: "#EDF5F0",
    primary: "#5FC29D",
    primaryForeground: "#07110D",
    secondary: "#1C342A",
    secondaryForeground: "#EDF5F0",
    muted: "#1A2D25",
    mutedForeground: "#A6BDB3",
    accent: "#1C342A",
    accentForeground: "#EDF5F0",
    border: "#2A4438",
    input: "#2A4438",
    ring: "#5FC29D",
    destructive: "#F06A6A",
    destructiveForeground: "#0D1713",
    warning: "#F2A65A",
    shadowColor: "#000000",
  },
};

export function hexToRgbTriplet(hex) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255].join(" ");
}

export const RADIUS_REM = 0.875;
