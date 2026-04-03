/**
 * 颜色推荐算法
 * 基于色彩理论生成和谐的颜色组合
 */

// 将十六进制颜色转换为HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// 将HSL转换为十六进制颜色
export function hslToHex(h: number, s: number, l: number): string {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  let r: number, g: number, b: number;

  if (saturation === 0) {
    r = g = b = lightness;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// 生成互补色（色轮上相对的颜色）
function getComplementaryColor(hsl: { h: number; s: number; l: number }): string {
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
}

// 生成类似色（色轮上相邻的颜色）
function getAnalogousColors(hsl: { h: number; s: number; l: number }): string[] {
  return [
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
  ];
}

// 生成三分色（色轮上均匀分布的三个颜色）
function getTriadicColors(hsl: { h: number; s: number; l: number }): string[] {
  return [
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

// 生成分裂互补色
function getSplitComplementaryColors(hsl: { h: number; s: number; l: number }): string[] {
  return [
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
  ];
}

// 生成单色变化
function getMonochromaticColors(hsl: { h: number; s: number; l: number }): string[] {
  return [
    hslToHex(hsl.h, Math.max(20, hsl.s - 20), Math.min(90, hsl.l + 25)),
    hslToHex(hsl.h, Math.min(100, hsl.s + 10), Math.max(20, hsl.l - 15)),
    hslToHex(hsl.h, hsl.s, Math.max(15, Math.min(85, hsl.l + 35))),
  ];
}

// 根据基础颜色生成推荐的颜色组合
export function generateRecommendedColors(baseColor: string, count: number = 4): string[] {
  const hsl = hexToHsl(baseColor);
  const colors: string[] = [baseColor.toUpperCase()];

  // 根据需要的颜色数量选择不同的配色方案
  if (count === 2) {
    // 互补色方案
    colors.push(getComplementaryColor(hsl));
  } else if (count === 3) {
    // 三分色方案
    colors.push(...getTriadicColors(hsl));
  } else if (count === 4) {
    // 类似色 + 互补色方案
    const analogous = getAnalogousColors(hsl);
    colors.push(analogous[0]);
    colors.push(getComplementaryColor(hsl));
    colors.push(hslToHex((hsl.h + 180 + 30) % 360, hsl.s, hsl.l));
  } else if (count === 5) {
    // 分裂互补色方案
    colors.push(...getSplitComplementaryColors(hsl));
    const analogous = getAnalogousColors(hsl);
    colors.push(analogous[0]);
    colors.push(analogous[1]);
  } else if (count >= 6) {
    // 综合方案：类似色 + 分裂互补色
    const analogous = getAnalogousColors(hsl);
    const splitComp = getSplitComplementaryColors(hsl);
    colors.push(analogous[0]);
    colors.push(splitComp[0]);
    colors.push(getComplementaryColor(hsl));
    colors.push(splitComp[1]);
    colors.push(analogous[1]);
    
    // 如果需要更多颜色，添加单色变化
    if (count > 6) {
      const mono = getMonochromaticColors(hsl);
      for (let i = 0; i < Math.min(count - 6, mono.length); i++) {
        colors.push(mono[i]);
      }
    }
  }

  // 确保返回指定数量的颜色
  return colors.slice(0, count);
}

// 当用户修改某个颜色时，重新生成推荐
export function regenerateRecommendations(
  colors: string[],
  changedIndex: number,
  newColor: string
): string[] {
  const newColors = [...colors];
  newColors[changedIndex] = newColor;
  
  // 如果修改的是第一个颜色，基于新颜色重新生成整个推荐
  if (changedIndex === 0 && colors.length > 1) {
    return generateRecommendedColors(newColor, colors.length);
  }
  
  // 否则只更新修改的颜色
  return newColors;
}

// 添加新颜色时的推荐
export function recommendAdditionalColor(existingColors: string[]): string {
  if (existingColors.length === 0) {
    return '#5135FF';
  }
  
  const baseColor = existingColors[0];
  const hsl = hexToHsl(baseColor);
  
  // 根据已有颜色数量决定添加什么类型的颜色
  const count = existingColors.length;
  
  if (count === 1) {
    return getComplementaryColor(hsl);
  } else if (count === 2) {
    const triadic = getTriadicColors(hsl);
    return existingColors.includes(triadic[0]) ? triadic[1] : triadic[0];
  } else if (count === 3) {
    const analogous = getAnalogousColors(hsl);
    return analogous[0];
  } else if (count === 4) {
    const analogous = getAnalogousColors(hsl);
    return analogous[1];
  } else {
    // 随机生成一个和谐的变体
    const hueShift = (count * 30) % 360;
    const saturation = Math.max(30, Math.min(80, hsl.s + (Math.random() - 0.5) * 40));
    const lightness = Math.max(30, Math.min(70, hsl.l + (Math.random() - 0.5) * 30));
    return hslToHex((hsl.h + hueShift) % 360, saturation, lightness);
  }
}
