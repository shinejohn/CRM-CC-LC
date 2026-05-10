import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Copy, Check, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useGenerateEmailSignature } from './useMarketingAssets';
import type { MarketingProfile } from './useMarketingProfile';

interface EmailSignatureProps {
  profile: MarketingProfile;
}

export function EmailSignature({ profile }: EmailSignatureProps) {
  const [businessName, setBusinessName] = useState(profile.business_name);
  const [contactName, setContactName] = useState(profile.contact_name);
  const [contactTitle, setContactTitle] = useState(profile.contact_title);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [website, setWebsite] = useState(profile.website);
  const [accentColor, setAccentColor] = useState(profile.accent_color || '#4f46e5');
  const [includeContact, setIncludeContact] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const generateSignature = useGenerateEmailSignature();

  const handleGenerate = useCallback(async () => {
    try {
      const result = await generateSignature.mutateAsync({
        business_name: businessName,
        contact_name: contactName,
        contact_title: contactTitle,
        phone,
        email,
        website,
        accent_color: accentColor,
        include_contact: includeContact,
      });
      setGeneratedHtml(result.html);
    } catch {
      // Mutation error handled by TanStack Query
    }
  }, [generateSignature, businessName, contactName, contactTitle, phone, email, website, accentColor, includeContact]);

  const handleCopyHtml = useCallback(async () => {
    if (!generatedHtml) return;
    await navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedHtml]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--nexus-text-primary)]">
          Email Signature
        </h1>
        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
          Generate a professional HTML email signature for your team.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)] mb-3">
            Preview
          </h3>
          <div
            className="rounded-xl border border-[var(--nexus-card-border)] p-5 bg-white dark:bg-slate-900"
            style={{ maxWidth: 600 }}
          >
            <SignaturePreview
              businessName={businessName}
              contactName={contactName}
              contactTitle={contactTitle}
              phone={phone}
              email={email}
              website={website}
              accentColor={accentColor}
              includeContact={includeContact}
            />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--nexus-card-border)] p-4 bg-[var(--nexus-bg-secondary)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
              Signature Details
            </h3>

            <FieldRow label="Business Name" htmlFor="sig-business-name">
              <Input
                id="sig-business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="text-sm"
              />
            </FieldRow>

            <FieldRow label="Contact Name" htmlFor="sig-contact-name">
              <Input
                id="sig-contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="text-sm"
              />
            </FieldRow>

            <FieldRow label="Contact Title" htmlFor="sig-contact-title">
              <Input
                id="sig-contact-title"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                className="text-sm"
              />
            </FieldRow>

            <FieldRow label="Phone" htmlFor="sig-phone">
              <Input
                id="sig-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-sm"
              />
            </FieldRow>

            <FieldRow label="Email" htmlFor="sig-email">
              <Input
                id="sig-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
              />
            </FieldRow>

            <FieldRow label="Website" htmlFor="sig-website">
              <Input
                id="sig-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="text-sm"
              />
            </FieldRow>

            <div>
              <label
                htmlFor="sig-accent-color"
                className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
              >
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="sig-accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-[var(--nexus-card-border)] cursor-pointer"
                  aria-label="Select signature accent color"
                />
                <span className="text-xs text-[var(--nexus-text-tertiary)] font-mono">
                  {accentColor}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                <span className="text-sm text-[var(--nexus-text-primary)]">
                  Include individual contact
                </span>
              </div>
              <Switch
                checked={includeContact}
                onCheckedChange={setIncludeContact}
                aria-label="Toggle individual contact info in signature"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generateSignature.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--nexus-accent-primary)] hover:opacity-90 transition-opacity disabled:opacity-60"
            aria-label="Generate email signature HTML"
          >
            {generateSignature.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Copy HTML
          </button>

          {generatedHtml && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--nexus-text-secondary)]">
                  Generated HTML
                </span>
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  aria-label="Copy generated HTML to clipboard"
                  className="flex items-center gap-1 text-xs text-[var(--nexus-accent-primary)] hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-md overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                {generatedHtml}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SignaturePreview({
  businessName,
  contactName,
  contactTitle,
  phone,
  email,
  website,
  accentColor,
  includeContact,
}: {
  businessName: string;
  contactName: string;
  contactTitle: string;
  phone: string;
  email: string;
  website: string;
  accentColor: string;
  includeContact: boolean;
}) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600 }}>
      <tbody>
        <tr>
          {/* Accent bar */}
          <td style={{ width: 4, backgroundColor: accentColor, borderRadius: 2 }} />
          <td style={{ paddingLeft: 16 }}>
            <table cellPadding={0} cellSpacing={0}>
              <tbody>
                {includeContact && (
                  <tr>
                    <td style={{ paddingBottom: 4 }}>
                      <span className="text-base font-bold text-[var(--nexus-text-primary)]">
                        {contactName || 'Your Name'}
                      </span>
                      {contactTitle && (
                        <span className="text-sm text-[var(--nexus-text-secondary)] ml-2">
                          {contactTitle}
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ paddingBottom: 8 }}>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: accentColor }}
                    >
                      {businessName || 'Your Business'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--nexus-text-secondary)]">
                      {phone && <span>{phone}</span>}
                      {email && <span>{email}</span>}
                      {website && <span>{website}</span>}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
