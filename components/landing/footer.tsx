import { HeartIcon } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white py-8 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link href="/why" className="text-white/60 hover:text-white transition-colors">
            👉 Why This Tool
          </Link>
          <Link href="/insights" className="text-white/60 hover:text-white transition-colors">
            📊 Insights
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-white/40">
          <span>Made with</span>
          <HeartIcon size={12} />
          <span>by</span>
          <a
            href="https://x.com/jeremymoyson"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#FF4500] transition-colors underline"
          >
            @jeremymoyson
          </a>
        </div>
        <div className="flex items-center justify-center gap-6 text-sm text-white/40">
          <div>© {new Date().getFullYear()} CheckAIOverviews</div>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
