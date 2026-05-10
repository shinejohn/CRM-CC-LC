import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Palette, Download, Image, Check } from 'lucide-react';
import type { MarketingProfile } from './useMarketingProfile';

interface BrandedImageProps {
  profile: MarketingProfile;
}

interface ColorTheme {
  key: string;
  label: string;
  primary: string;
  secondary: string;
  swatch: string;
}

const COLOR_THEMES: ColorTheme[] = [
  { key: 'blue', label: 'Blue', primary: '#2563eb', secondary: '#1e3a5f', swatch: '#3b82f6' },
  { key: 'green', label: 'Green', primary: '#059669', secondary: '#064e3b', swatch: '#10b981' },
  { key: 'orange', label: 'Orange', primary: '#d97706', secondary: '#78350f', swatch: '#f59e0b' },
  { key: 'purple', label: 'Purple', primary: '#7c3aed', secondary: '#3b0764', swatch: '#8b5cf6' },
  { key: 'red', label: 'Red', primary: '#dc2626', secondary: '#7f1d1d', swatch: '#ef4444' },
  { key: 'teal', label: 'Teal', primary: '#0d9488', secondary: '#134e4a', swatch: '#14b8a6' },
];

function downloadSvg(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPng(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new window.Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, 1200, 630);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    a.click();
  };
  img.src = url;
}

export function BrandedImage({ profile }: BrandedImageProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>('blue');
  const svgRef = useRef<SVGSVGElement>(null);

  const theme = COLOR_THEMES.find((t) => t.key === selectedTheme) ?? COLOR_THEMES[0];

  const handleDownloadSvg = useCallback(() => {
    if (!svgRef.current) return;
    downloadSvg(svgRef.current, `${profile.business_name}-branded.svg`);
  }, [profile.business_name]);

  const handleDownloadPng = useCallback(() => {
    if (!svgRef.current) return;
    downloadPng(svgRef.current, `${profile.business_name}-branded.png`);
  }, [profile.business_name]);

  // Scaled preview
  const previewWidth = 600;
  const previewHeight = 315;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--nexus-text-primary)]">
          Branded Image
        </h1>
        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
          Generate a 1200x630 branded image for link previews and sharing.
        </p>
      </div>

      {/* Color theme selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[var(--nexus-text-secondary)]">
          Color Theme:
        </span>
        {COLOR_THEMES.map((ct) => {
          const isActive = selectedTheme === ct.key;
          return (
            <button
              key={ct.key}
              type="button"
              onClick={() => setSelectedTheme(ct.key)}
              aria-label={`Select ${ct.label} color theme`}
              className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                isActive
                  ? 'border-[var(--nexus-text-primary)] scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: ct.swatch }}
            >
              {isActive && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Preview */}
      <div className="rounded-xl border border-[var(--nexus-card-border)] overflow-hidden inline-block shadow-sm">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 630"
          width={previewWidth}
          height={previewHeight}
          role="img"
          aria-label={`Branded image for ${profile.business_name}`}
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id={`brand-grad-${theme.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.primary} />
              <stop offset="100%" stopColor={theme.secondary} />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill={`url(#brand-grad-${theme.key})`} />

          {/* Decorative elements */}
          <circle cx="1050" cy="150" r="200" fill="rgba(255,255,255,0.06)" />
          <circle cx="1100" cy="500" r="120" fill="rgba(255,255,255,0.04)" />
          <rect x="0" y="580" width="1200" height="50" fill="rgba(0,0,0,0.15)" />

          {/* Accent line */}
          <rect x="80" y="200" width="80" height="6" rx="3" fill="rgba(255,255,255,0.5)" />

          {/* Business name */}
          <text
            x="80"
            y="280"
            fill="white"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize="72"
          >
            {profile.business_name}
          </text>

          {/* Community */}
          <text
            x="80"
            y="340"
            fill="rgba(255,255,255,0.7)"
            fontFamily="Arial, sans-serif"
            fontSize="32"
          >
            {profile.community.name}, {profile.community.state}
          </text>

          {/* Alphasite URL */}
          <text
            x="80"
            y="610"
            fill="rgba(255,255,255,0.5)"
            fontFamily="Arial, sans-serif"
            fontSize="20"
          >
            {profile.alphasite_url}
          </text>

          {/* Tagline */}
          {profile.tagline && (
            <text
              x="80"
              y="410"
              fill="rgba(255,255,255,0.55)"
              fontFamily="Arial, sans-serif"
              fontSize="24"
              fontStyle="italic"
            >
              {profile.tagline}
            </text>
          )}
        </svg>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDownloadSvg}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
          aria-label="Download branded image as SVG"
        >
          <Download className="w-4 h-4" />
          Download SVG
        </button>
        <button
          type="button"
          onClick={handleDownloadPng}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.primary }}
          aria-label="Download branded image as PNG"
        >
          <Image className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </div>
  );
}
