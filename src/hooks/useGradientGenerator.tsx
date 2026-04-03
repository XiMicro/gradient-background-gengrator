import { useState, useCallback, useEffect } from 'react';
import { colorToParam, recommendColorPalette } from '@/lib/utils';

type ColorMode = 'free' | 'recommended';

interface CachedData {
  freeModeColors: string[];
  recommendedModeColors: string[];
  lastUsedBaseColor: string | null;
}

const CACHE_KEY = 'gradient-generator-cache';

function loadCache(): CachedData {
  if (typeof window === 'undefined') {
    return {
      freeModeColors: ['#5135FF', '#FF5828', '#F69CFF', '#FFA50F'],
      recommendedModeColors: ['#5135FF', '#FF5828', '#F69CFF', '#FFA50F'],
      lastUsedBaseColor: null
    };
  }
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Failed to load cache:', e);
  }
  return {
    freeModeColors: ['#5135FF', '#FF5828', '#F69CFF', '#FFA50F'],
    recommendedModeColors: ['#5135FF', '#FF5828', '#F69CFF', '#FFA50F'],
    lastUsedBaseColor: null
  };
}

function saveCache(cache: CachedData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save cache:', e);
  }
}

export function useGradientGenerator() {
  const [cache, setCache] = useState<CachedData>(loadCache);
  const [colorMode, setColorMode] = useState<ColorMode>('free');
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);

  const colors = colorMode === 'free' ? cache.freeModeColors : cache.recommendedModeColors;

  const setColors = useCallback((newColors: string[]) => {
    setCache(prev => {
      const updated = {
        ...prev,
        [colorMode === 'free' ? 'freeModeColors' : 'recommendedModeColors']: newColors
      };
      saveCache(updated);
      return updated;
    });
  }, [colorMode]);

  const switchColorMode = useCallback((mode: ColorMode) => {
    setColorMode(mode);
    if (mode === 'recommended' && !hasGeneratedRecommendations && cache.lastUsedBaseColor) {
      const recommended = recommendColorPalette(cache.lastUsedBaseColor);
      setCache(prev => {
        const updated = {
          ...prev,
          recommendedModeColors: recommended
        };
        saveCache(updated);
        return updated;
      });
      setHasGeneratedRecommendations(true);
    }
  }, [cache.lastUsedBaseColor, hasGeneratedRecommendations]);

  const generateRecommendations = useCallback((baseColor: string) => {
    const recommended = recommendColorPalette(baseColor);
    setCache(prev => {
      const updated = {
        ...prev,
        recommendedModeColors: recommended,
        lastUsedBaseColor: baseColor
      };
      saveCache(updated);
      return updated;
    });
    setHasGeneratedRecommendations(true);
  }, []);

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

  useEffect(() => {
    generateGradient();
  }, [generateGradient]);

  return {
    colors,
    setColors,
    colorMode,
    switchColorMode,
    generateRecommendations,
    hasGeneratedRecommendations,
    width,
    setWidth,
    height,
    setHeight,
    svgContent,
    isGenerating,
    generateGradient,
    downloadGradient
  };
}