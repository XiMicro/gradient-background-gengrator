'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGradientGenerator } from '@/hooks/useGradientGenerator';
import { colorPresets } from '@/lib/constants';
import { colorToParam } from '@/lib/utils';
import { Download, RefreshCw, Plus, Trash2, Palette, Sparkles, Layers, Code, Zap, Wand2, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GradientGenerator() {
  const {
    colors,
    width,
    setWidth,
    height,
    setHeight,
    svgContent,
    isGenerating,
    colorMode,
    generateGradient,
    downloadGradient,
    handleColorChange,
    addColor,
    removeColor,
    switchMode,
    regenerateRecommendations,
    applyPreset
  } = useGradientGenerator();

  const [newColor, setNewColor] = useState('');
  const [apiLinkCopied, setApiLinkCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    generateGradient();
  }, [generateGradient]);

  const handleAddColor = () => {
    if (colors.length < 8) {
      if (colorMode === 'free' && newColor) {
        addColor(newColor);
        setNewColor('');
      } else {
        addColor();
      }
    }
  };

  const handleApplyPreset = (preset: typeof colorPresets[0]) => {
    applyPreset(preset.colors);
  };

  const generateApiLink = () => {
    if (!mounted) return '';
    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/api`
      : '/api';
    const params = new URLSearchParams();
    colors.forEach(color => params.append('colors', colorToParam(color)));
    params.append('width', width.toString());
    params.append('height', height.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const copyApiLink = async () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        const apiLink = generateApiLink();
        await navigator.clipboard.writeText(apiLink);
        setApiLinkCopied(true);
        setTimeout(() => setApiLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy API link:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 animate-fade-in">
            <Palette className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight">
            Gradient Generator
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
            Create stunning, randomized SVG gradients for your next project. 
            <span className="text-primary font-medium ml-1">Simple, fast, and open source.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border p-1.5 sm:p-2">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center border border-border/50">
                {svgContent ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    className="w-full h-full transform transition-transform duration-500 hover:scale-[1.01] [&>svg]:w-full [&>svg]:h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-primary"></div>
                    <span className="text-sm font-medium font-display">Generating...</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    onClick={generateGradient} 
                    disabled={isGenerating}
                    size="sm"
                    className="bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-foreground shadow-sm backdrop-blur-sm border border-black/5 dark:border-white/10"
                  >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                onClick={downloadGradient} 
                disabled={!svgContent}
                className="flex-1 h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Download SVG
              </Button>
              <Button 
                variant="outline"
                className="flex-1 h-12 text-base font-medium border-2 hover:bg-muted/50"
                onClick={copyApiLink}
              >
                 <Code className="w-5 h-5 mr-2" />
                 {apiLinkCopied ? 'Link Copied!' : 'Copy API Link'}
              </Button>
            </div>

            {/* API Section */}
            <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 font-display text-lg font-semibold">
                <Zap className="w-5 h-5 text-chart-2" />
                <span>Developer API</span>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 font-mono text-xs sm:text-sm text-muted-foreground break-all shadow-sm">
                {generateApiLink() || 'Loading...'}
              </div>
               <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Hex colors required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                    <span>Auto-optimized</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Dimensions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                 <Layers className="w-5 h-5 text-primary" />
                 <h2 className="font-display font-semibold text-lg">Dimensions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Width</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Height</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Mode Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Color Mode</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-xl">
                <button
                  onClick={() => switchMode('free')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    colorMode === 'free'
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  <Palette className="w-4 h-4" />
                  Free Select
                </button>
                <button
                  onClick={() => switchMode('recommend')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    colorMode === 'recommend'
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  <Wand2 className="w-4 h-4" />
                  Recommend
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {colorMode === 'free' 
                  ? "Free mode: Manually select each color for full control." 
                  : "Recommend mode: System generates harmonious color combinations based on your first color selection."}
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-semibold text-lg">Colors</h2>
                </div>
                <div className="flex items-center gap-2">
                  {colorMode === 'recommend' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={regenerateRecommendations}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regen
                    </Button>
                  )}
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
                    {colors.length}/8
                  </span>
                </div>
              </div>
              
              {/* Base Color Hint for Recommend Mode */}
              {colorMode === 'recommend' && colors.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-primary font-medium mb-1">
                    <Wand2 className="w-4 h-4" />
                    <span>Base Color</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Modify the first color to regenerate the entire harmonious palette.
                  </p>
                </div>
              )}
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="relative flex-shrink-0">
                       <Input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className={cn(
                          "w-12 h-12 p-1 rounded-xl cursor-pointer border-2 transition-colors",
                          colorMode === 'recommend' && index === 0 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "hover:border-primary"
                        )}
                      />
                      {colorMode === 'recommend' && index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Wand2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <Input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="font-mono text-sm tracking-wider uppercase"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColor(index)}
                      disabled={colors.length <= 1}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

               {colors.length < 8 && (
                <div className="flex items-center gap-3 pt-2">
                   {colorMode === 'free' ? (
                     <>
                       <div className="relative flex-shrink-0">
                          <Input
                            type="color"
                            value={newColor || '#000000'}
                            onChange={(e) => setNewColor(e.target.value)}
                             className="w-12 h-12 p-1 rounded-xl cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors"
                          />
                       </div>
                       <Input
                          type="text"
                          placeholder="#000000"
                          value={newColor.toUpperCase()}
                          onChange={(e) => setNewColor(e.target.value)}
                          className="font-mono text-sm tracking-wider uppercase"
                        />
                       <Button 
                        onClick={handleAddColor}
                        disabled={!newColor}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                     </>
                   ) : (
                     <Button 
                      onClick={handleAddColor}
                      className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Recommended Color
                    </Button>
                   )}
                </div>
               )}
            </div>

            {/* Presets */}
             <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                 <Sparkles className="w-5 h-5 text-primary" />
                 <h2 className="font-display font-semibold text-lg">Presets</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="group relative overflow-hidden rounded-lg aspect-[3/2] border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div 
                      className="absolute inset-0" 
                      style={{ background: `linear-gradient(135deg, ${preset.colors.join(', ')})` }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
