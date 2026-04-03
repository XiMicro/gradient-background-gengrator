import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function colorToParam(color: string): string {
  if (color.startsWith('#')) {
    return 'hex_' + color.slice(1);
  }
  return color;
}

export function paramToColor(param: string): string {
  if (param.startsWith('hex_')) {
    return '#' + param.slice(4);
  }
  return param;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): HSL {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = h / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(hsl: HSL): string {
  const { h } = hsl;
  let { s, l } = hsl;
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function getComplementaryColor(hex: string): string {
  const hsl = hexToHsl(hex);
  hsl.h = (hsl.h + 180) % 360;
  return hslToHex(hsl);
}

export function getAnalogousColors(hex: string, count: number = 2): string[] {
  const hsl = hexToHsl(hex);
  const colors: string[] = [];
  const step = 30;
  for (let i = 1; i <= count; i++) {
    const newHsl1 = { ...hsl, h: (hsl.h + step * i) % 360 };
    const newHsl2 = { ...hsl, h: (hsl.h - step * i + 360) % 360 };
    colors.push(hslToHex(newHsl1));
    colors.push(hslToHex(newHsl2));
  }
  return colors.slice(0, count);
}

export function getTriadicColors(hex: string): string[] {
  const hsl = hexToHsl(hex);
  const colors: string[] = [];
  for (let i = 1; i <= 2; i++) {
    const newHsl = { ...hsl, h: (hsl.h + 120 * i) % 360 };
    colors.push(hslToHex(newHsl));
  }
  return colors;
}

export function getTetradicColors(hex: string): string[] {
  const hsl = hexToHsl(hex);
  const colors: string[] = [];
  const offsets = [90, 180, 270];
  offsets.forEach(offset => {
    const newHsl = { ...hsl, h: (hsl.h + offset) % 360 };
    colors.push(hslToHex(newHsl));
  });
  return colors;
}

export function getSplitComplementaryColors(hex: string): string[] {
  const hsl = hexToHsl(hex);
  const colors: string[] = [];
  const offsets = [150, 210];
  offsets.forEach(offset => {
    const newHsl = { ...hsl, h: (hsl.h + offset) % 360 };
    colors.push(hslToHex(newHsl));
  });
  return colors;
}

export function adjustBrightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToHex(hsl);
}

export function adjustSaturation(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
  return hslToHex(hsl);
}

export function recommendColorPalette(baseColor: string): string[] {
  const palette: string[] = [baseColor];
  
  const complementary = getComplementaryColor(baseColor);
  const triadic = getTriadicColors(baseColor);
  const analogous = getAnalogousColors(baseColor, 2);
  
  const candidates = [...new Set([complementary, ...triadic, ...analogous])];
  
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  
  while (palette.length < 4 && shuffled.length > 0) {
    const color = shuffled.pop();
    if (color && !palette.includes(color)) {
      palette.push(color);
    }
  }
  
  while (palette.length < 4) {
    const brightnessAdjustments = [20, -15, 25, -20];
    const saturationAdjustments = [15, -10, 20, -15];
    const randomBrightness = brightnessAdjustments[Math.floor(Math.random() * brightnessAdjustments.length)];
    const randomSaturation = saturationAdjustments[Math.floor(Math.random() * saturationAdjustments.length)];
    let newColor = adjustBrightness(baseColor, randomBrightness);
    newColor = adjustSaturation(newColor, randomSaturation);
    if (!palette.includes(newColor)) {
      palette.push(newColor);
    }
  }
  
  return palette;
}