'use client';

import { useState, useEffect } from 'react';
import { Twitter, Linkedin, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  domain: string;
  impactPercentage: number;
  totalKeywords: number;
  affectedKeywords: number;
}

export function ShareButtons({ domain, impactPercentage, totalKeywords, affectedKeywords }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(`https://scanaio.com/d/${domain}`);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const tweetText = impactPercentage >= 50
    ? `ScanAIO.com\n\n${impactPercentage}% of ${domain}'s keywords trigger Google AI Overviews`
    : `ScanAIO.com\n\n${affectedKeywords}/${totalKeywords} keywords on ${domain} trigger AI Overviews`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-xs text-black/40 mr-2">Share:</span>
      <button
        onClick={handleShareTwitter}
        className="p-2 bg-black text-white hover:bg-black/80 transition-all"
        title="Share on X"
        data-umami-event="share_twitter"
        data-umami-event-domain={domain}
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={handleShareLinkedIn}
        className="p-2 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/80 transition-all"
        title="Share on LinkedIn"
        data-umami-event="share_linkedin"
        data-umami-event-domain={domain}
      >
        <Linkedin className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopyLink}
        className={`p-2 transition-all ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-black/5 text-black/60 hover:bg-black/10'
        }`}
        title="Copy link"
        data-umami-event="share_copy"
        data-umami-event-domain={domain}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
