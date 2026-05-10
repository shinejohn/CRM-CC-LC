import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Share2, Download, Image, Copy, Check,
  Megaphone, CalendarDays, Newspaper, Sparkles,
} from 'lucide-react';
import type { MarketingProfile } from './useMarketingProfile';

interface SocialPostsProps {
  profile: MarketingProfile;
}

type PostType = 'promo' | 'event' | 'news' | 'brand';

interface PostTypeOption {
  key: PostType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  headlineTemplate: string;
  captionTemplate: string;
  hashtagsTemplate: string;
  bgColors: [string, string];
}

const POST_TYPES: PostTypeOption[] = [
  {
    key: 'promo',
    label: 'Promo',
    icon: Megaphone,
    headlineTemplate: 'Special Offer',
    captionTemplate: 'Don\'t miss our latest deal! Visit us today and save.',
    hashtagsTemplate: '#LocalBusiness #ShopLocal #SpecialOffer #SupportSmall',
    bgColors: ['#f59e0b', '#d97706'],
  },
  {
    key: 'event',
    label: 'Event',
    icon: CalendarDays,
    headlineTemplate: 'Upcoming Event',
    captionTemplate: 'Join us for an exciting event in the community!',
    hashtagsTemplate: '#LocalEvent #Community #JoinUs #Networking',
    bgColors: ['#8b5cf6', '#7c3aed'],
  },
  {
    key: 'news',
    label: 'News',
    icon: Newspaper,
    headlineTemplate: 'Local News',
    captionTemplate: 'Stay informed about what\'s happening in your community.',
    hashtagsTemplate: '#LocalNews #CommunityUpdate #StayInformed #Neighbors',
    bgColors: ['#3b82f6', '#2563eb'],
  },
  {
    key: 'brand',
    label: 'Brand',
    icon: Sparkles,
    headlineTemplate: 'About Us',
    captionTemplate: 'We\'re proud to be part of this amazing community. Learn more about what we do!',
    hashtagsTemplate: '#AboutUs #OurStory #LocalBusiness #Community',
    bgColors: ['#10b981', '#059669'],
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

function downloadPng(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgEl);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new window.Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, 1080, 1080);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    a.click();
  };
  img.src = url;
}

export function SocialPosts({ profile }: SocialPostsProps) {
  const [selectedType, setSelectedType] = useState<PostType>('promo');
  const [captionText, setCaptionText] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const postType = POST_TYPES.find((t) => t.key === selectedType) ?? POST_TYPES[0];
  const accentColor = profile.accent_color || '#4f46e5';

  const fullCaption = captionText || `${postType.captionTemplate}\n\n${postType.hashtagsTemplate}`;

  const handleCopyCaption = useCallback(async () => {
    await navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }, [fullCaption]);

  const handleDownloadSvg = useCallback(() => {
    if (!svgRef.current) return;
    downloadSvg(svgRef.current, `${profile.business_name}-${selectedType}-post.svg`);
  }, [profile.business_name, selectedType]);

  const handleDownloadPng = useCallback(() => {
    if (!svgRef.current) return;
    downloadPng(svgRef.current, `${profile.business_name}-${selectedType}-post.png`);
  }, [profile.business_name, selectedType]);

  // Preview scale
  const previewSize = 400;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--nexus-text-primary)]">
          Social Posts
        </h1>
        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
          Generate 1080x1080 social media post images with captions.
        </p>
      </div>

      {/* Post type selector */}
      <div className="flex flex-wrap gap-2">
        {POST_TYPES.map((pt) => {
          const Icon = pt.icon;
          const isActive = selectedType === pt.key;
          return (
            <button
              key={pt.key}
              type="button"
              onClick={() => setSelectedType(pt.key)}
              aria-label={`Select ${pt.label} post type`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'text-[var(--nexus-text-secondary)] border-[var(--nexus-card-border)] hover:bg-[var(--nexus-bg-secondary)]'
              }`}
              style={isActive ? { backgroundColor: pt.bgColors[0] } : undefined}
            >
              <Icon className="w-4 h-4" />
              {pt.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SVG Preview */}
        <div className="rounded-xl border border-[var(--nexus-card-border)] overflow-hidden inline-block">
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1080 1080"
            width={previewSize}
            height={previewSize}
            role="img"
            aria-label={`${postType.label} social post for ${profile.business_name}`}
          >
            {/* Background */}
            <defs>
              <linearGradient id={`post-grad-${postType.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={postType.bgColors[0]} />
                <stop offset="100%" stopColor={postType.bgColors[1]} />
              </linearGradient>
            </defs>
            <rect width="1080" height="1080" fill={`url(#post-grad-${postType.key})`} />

            {/* Decorative shapes */}
            <circle cx="900" cy="200" r="180" fill="rgba(255,255,255,0.08)" />
            <circle cx="180" cy="880" r="140" fill="rgba(255,255,255,0.06)" />

            {/* Type badge */}
            <rect x="80" y="80" width="200" height="44" rx="22" fill="rgba(255,255,255,0.2)" />
            <text
              x="180"
              y="108"
              fill="white"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
              fontSize="18"
              textAnchor="middle"
            >
              {postType.headlineTemplate.toUpperCase()}
            </text>

            {/* Business name */}
            <text
              x="80"
              y="480"
              fill="white"
              fontFamily="Arial, sans-serif"
              fontWeight="bold"
              fontSize="64"
            >
              {profile.business_name}
            </text>

            {/* Tagline */}
            {profile.tagline && (
              <text
                x="80"
                y="540"
                fill="rgba(255,255,255,0.85)"
                fontFamily="Arial, sans-serif"
                fontSize="28"
              >
                {profile.tagline}
              </text>
            )}

            {/* Community */}
            <text
              x="80"
              y="960"
              fill="rgba(255,255,255,0.6)"
              fontFamily="Arial, sans-serif"
              fontSize="22"
            >
              {profile.community.name}, {profile.community.state}
            </text>

            {/* Website */}
            <text
              x="80"
              y="1000"
              fill="rgba(255,255,255,0.45)"
              fontFamily="Arial, sans-serif"
              fontSize="18"
            >
              {profile.website}
            </text>
          </svg>
        </div>

        {/* Caption + actions */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--nexus-card-border)] p-4 bg-[var(--nexus-bg-secondary)] space-y-3">
            <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
              Caption
            </h3>
            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder={`${postType.captionTemplate}\n\n${postType.hashtagsTemplate}`}
              rows={6}
              aria-label="Post caption text"
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-primary)] p-3 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            />
            <button
              type="button"
              onClick={handleCopyCaption}
              aria-label="Copy caption to clipboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--nexus-accent-primary)] hover:bg-[var(--nexus-bg-primary)] transition-colors"
            >
              {copiedCaption ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Caption
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
              aria-label="Download social post as SVG"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: postType.bgColors[0] }}
              aria-label="Download social post as PNG"
            >
              <Image className="w-4 h-4" />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
