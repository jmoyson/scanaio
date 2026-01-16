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
  const [shareUrl, setShareUrl] = useState(`https://checkaioverviews.com/${domain}`);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const tweetText = impactPercentage >= 50
    ? `${impactPercentage}% of ${domain}'s keywords are affected by Google's AI Overviews.\n\nCheck your domain:`
    : `Just checked ${domain} - ${affectedKeywords}/${totalKeywords} keywords trigger AI Overviews.\n\nCheck yours:`;

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
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
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
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={handleShareLinkedIn}
        className="p-2 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/80 transition-all"
        title="Share on LinkedIn"
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
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
