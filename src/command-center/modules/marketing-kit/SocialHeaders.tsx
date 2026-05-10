import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Image, Download, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { MarketingProfile } from './useMarketingProfile';

interface SocialHeadersProps {
  profile: MarketingProfile;
}

interface PlatformSpec {
  key: string;
  label: string;
  width: number;
  height: number;
  tips: string[];
}

const PLATFORMS: PlatformSpec[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    width: 820,
    height: 312,
    tips: [
      'Cover photo is cropped differently on mobile -- keep key content centered.',
      'Avoid text-heavy designs; Facebook may penalize reach.',
      'Update seasonally to keep your page looking fresh.',
    ],
  },
  {
    key: 'x',
    label: 'X',
    width: 1500,
    height: 500,
    tips: [
      'Profile picture overlaps the bottom-left corner on desktop.',
      'Use a clean, wide layout that works across screen sizes.',
      'Brand colors and tagline work best here.',
    ],
  },
  {
    key: 'instagram',
    label: 'Instagram',
    width: 1080,
    height: 1080,
    tips: [
      'Instagram profile headers are square -- fill the space.',
      'Highlight grid posts create a mosaic effect; align your cover accordingly.',
      'Keep branding minimal and visually cohesive.',
    ],
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    width: 1080,
    height: 1920,
    tips: [
      'Vertical format -- use the full height for impact.',
      'Bottom 150px may be hidden by UI elements on mobile.',
      'Bold text and strong contrast perform well here.',
    ],
  },
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

function downloadPng(svgEl: SVGSVGElement, filename: string, width: number, height: number) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new window.Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    a.click();
  };
  img.src = url;
}

export function SocialHeaders({ profile }: SocialHeadersProps) {
  const [activePlatform, setActivePlatform] = useState('facebook');
  const svgRef = useRef<SVGSVGElement>(null);

  const platform = PLATFORMS.find((p) => p.key === activePlatform) ?? PLATFORMS[0];
  const accentColor = profile.accent_color || '#4f46e5';

  const handleDownloadSvg = useCallback(() => {
    if (!svgRef.current) return;
    downloadSvg(svgRef.current, `${profile.business_name}-${platform.key}-header.svg`);
  }, [profile.business_name, platform.key]);

  const handleDownloadPng = useCallback(() => {
    if (!svgRef.current) return;
    downloadPng(
      svgRef.current,
      `${profile.business_name}-${platform.key}-header.png`,
      platform.width,
      platform.height,
    );
  }, [profile.business_name, platform]);

  // Compute a scaled-down preview size
  const maxPreviewWidth = 720;
  const scale = Math.min(1, maxPreviewWidth / platform.width);
  const previewWidth = platform.width * scale;
  const previewHeight = platform.height * scale;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--nexus-text-primary)]">
          Social Headers
        </h1>
        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
          Generate platform-optimized header images for your social profiles.
        </p>
      </div>

      <Tabs value={activePlatform} onValueChange={setActivePlatform}>
        <TabsList>
          {PLATFORMS.map((p) => (
            <TabsTrigger key={p.key} value={p.key} className="text-sm">
              {p.label}
              <span className="ml-1.5 text-[10px] text-[var(--nexus-text-tertiary)]">
                {p.width}x{p.height}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {PLATFORMS.map((p) => (
          <TabsContent key={p.key} value={p.key} className="mt-4 space-y-5">
            {/* SVG Preview */}
            <div className="rounded-xl border border-[var(--nexus-card-border)] overflow-hidden inline-block">
              <svg
                ref={activePlatform === p.key ? svgRef : undefined}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${p.width} ${p.height}`}
                width={previewWidth}
                height={previewHeight}
                role="img"
                aria-label={`${p.label} header preview for ${profile.business_name}`}
              >
                {/* Background gradient */}
                <defs>
                  <linearGradient id={`hdr-grad-${p.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={accentColor} />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                </defs>
                <rect width={p.width} height={p.height} fill={`url(#hdr-grad-${p.key})`} />

                {/* Decorative circle */}
                <circle
                  cx={p.width * 0.85}
                  cy={p.height * 0.3}
                  r={p.height * 0.4}
                  fill="rgba(255,255,255,0.06)"
                />

                {/* Business name */}
                <text
                  x={p.width * 0.06}
                  y={p.height * 0.45}
                  fill="white"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                  fontSize={Math.max(24, p.height * 0.12)}
                >
                  {profile.business_name}
                </text>

                {/* Tagline */}
                {profile.tagline && (
                  <text
                    x={p.width * 0.06}
                    y={p.height * 0.62}
                    fill="rgba(255,255,255,0.8)"
                    fontFamily="Arial, sans-serif"
                    fontSize={Math.max(14, p.height * 0.06)}
                  >
                    {profile.tagline}
                  </text>
                )}

                {/* Community */}
                <text
                  x={p.width * 0.06}
                  y={p.height * 0.82}
                  fill="rgba(255,255,255,0.55)"
                  fontFamily="Arial, sans-serif"
                  fontSize={Math.max(12, p.height * 0.045)}
                >
                  {profile.community.name}, {profile.community.state}
                </text>
              </svg>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                aria-label={`Download ${p.label} header as SVG`}
              >
                <Download className="w-4 h-4" />
                Download SVG
              </button>
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
                aria-label={`Download ${p.label} header as PNG`}
              >
                <Image className="w-4 h-4" />
                Download PNG
              </button>
            </div>

            {/* Strategy tips */}
            <div className="rounded-xl border border-[var(--nexus-card-border)] p-4 bg-[var(--nexus-bg-secondary)]">
              <h4 className="text-sm font-semibold text-[var(--nexus-text-primary)] mb-2">
                {p.label} Tips
              </h4>
              <ul className="space-y-1.5">
                {p.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-[var(--nexus-text-secondary)] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accentColor }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
