import { useState, useCallback, useRef } from 'react';
import { colorToParam } from '@/lib/utils';
import { generateRecommendedColors, recommendAdditionalColor } from '@/lib/colorRecommendation';

export type ColorMode = 'free' | 'recommend';

interface CachedModeData {
  colors: string[];
  baseColor?: string;
}

export function useGradientGenerator() {
  // 当前模式
  const [colorMode, setColorMode] = useState<ColorMode>('free');
  
  // 当前颜色列表
  const [colors, setColors] = useState<string[]>(['#5135FF', '#FF5828', '#F69CFF', '#FFA50F']);
  
  // 模式数据缓存
  const cachedDataRef = useRef<Record<ColorMode, CachedModeData>>({
    free: { colors: ['#5135FF', '#FF5828', '#F69CFF', '#FFA50F'] },
    recommend: { colors: ['#5135FF', '#FF5828', '#F69CFF', '#FFA50F'], baseColor: '#5135FF' }
  });
  
  // 推荐模式下，记录是否已经生成过推荐
  const hasGeneratedRef = useRef<Record<ColorMode, boolean>>({
    free: false,
    recommend: false
  });

  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 切换模式
  const switchMode = useCallback((newMode: ColorMode) => {
    if (newMode === colorMode) return;
    
    // 保存当前模式的数据
    cachedDataRef.current[colorMode] = {
      colors: [...colors],
      baseColor: colorMode === 'recommend' ? colors[0] : undefined
    };
    hasGeneratedRef.current[colorMode] = true;
    
    // 恢复目标模式的数据
    const cachedData = cachedDataRef.current[newMode];
    setColors(cachedData.colors);
    setColorMode(newMode);
    
    // 如果是推荐模式且是首次切换，基于第一个颜色生成推荐
    if (newMode === 'recommend' && !hasGeneratedRef.current.recommend) {
      const recommended = generateRecommendedColors(cachedData.colors[0] || '#5135FF', cachedData.colors.length || 4);
      setColors(recommended);
      cachedDataRef.current.recommend = { colors: recommended, baseColor: recommended[0] };
      hasGeneratedRef.current.recommend = true;
    }
  }, [colorMode, colors]);

  // 处理颜色变化
  const handleColorChange = useCallback((index: number, newColor: string) => {
    setColors(prevColors => {
      let updatedColors: string[];
      
      if (colorMode === 'recommend' && index === 0) {
        // 推荐模式下修改第一个颜色，重新生成整个推荐
        updatedColors = generateRecommendedColors(newColor, prevColors.length);
      } else {
        // 其他情况只更新指定颜色
        updatedColors = [...prevColors];
        updatedColors[index] = newColor;
      }
      
      // 更新缓存
      cachedDataRef.current[colorMode] = {
        colors: updatedColors,
        baseColor: colorMode === 'recommend' ? updatedColors[0] : undefined
      };
      
      return updatedColors;
    });
  }, [colorMode]);

  // 添加颜色
  const addColor = useCallback((newColor?: string) => {
    setColors(prevColors => {
      if (prevColors.length >= 8) return prevColors;
      
      let colorToAdd: string;
      
      if (newColor) {
        colorToAdd = newColor;
      } else if (colorMode === 'recommend') {
        // 推荐模式下，基于第一个颜色推荐新颜色
        colorToAdd = recommendAdditionalColor(prevColors);
      } else {
        // 自由模式下，添加默认颜色
        colorToAdd = '#000000';
      }
      
      const updatedColors = [...prevColors, colorToAdd];
      
      // 更新缓存
      cachedDataRef.current[colorMode] = {
        colors: updatedColors,
        baseColor: colorMode === 'recommend' ? updatedColors[0] : undefined
      };
      
      return updatedColors;
    });
  }, [colorMode]);

  // 删除颜色
  const removeColor = useCallback((index: number) => {
    setColors(prevColors => {
      if (prevColors.length <= 1) return prevColors;
      
      const updatedColors = prevColors.filter((_, i) => i !== index);
      
      // 更新缓存
      cachedDataRef.current[colorMode] = {
        colors: updatedColors,
        baseColor: colorMode === 'recommend' ? updatedColors[0] : undefined
      };
      
      return updatedColors;
    });
  }, [colorMode]);

  // 重新生成推荐（仅在推荐模式下）
  const regenerateRecommendations = useCallback(() => {
    if (colorMode !== 'recommend') return;
    
    setColors(prevColors => {
      const baseColor = prevColors[0];
      const recommended = generateRecommendedColors(baseColor, prevColors.length);
      
      // 更新缓存
      cachedDataRef.current.recommend = {
        colors: recommended,
        baseColor: recommended[0]
      };
      
      return recommended;
    });
  }, [colorMode]);

  const generateGradient = useCallback(async () => {
    setIsGenerating(true);
    try {
      const params = new URLSearchParams();
      colors.forEach(color => params.append('colors', colorToParam(color)));
      params.append('width', width.toString());
      params.append('height', height.toString());
      const response = await fetch(`/api?${params.toString()}`);
      const svg = await response.text();
      setSvgContent(svg);
    } catch (error) {
      console.error('Error generating gradient:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [colors, width, height]);

  const downloadGradient = useCallback(() => {
    if (!svgContent) return;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradient-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [svgContent]);

  // 应用预设颜色
  const applyPreset = useCallback((presetColors: string[]) => {
    setColors(presetColors);
    cachedDataRef.current[colorMode] = {
      colors: [...presetColors],
      baseColor: colorMode === 'recommend' ? presetColors[0] : undefined
    };
  }, [colorMode]);

  return {
    // 状态
    colors,
    setColors,
    width,
    setWidth,
    height,
    setHeight,
    svgContent,
    isGenerating,
    colorMode,
    
    // 操作方法
    generateGradient,
    downloadGradient,
    handleColorChange,
    addColor,
    removeColor,
    switchMode,
    regenerateRecommendations,
    applyPreset,
    
    // 缓存数据（用于调试或持久化）
    cachedData: cachedDataRef.current
  };
}
