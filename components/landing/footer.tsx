export function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white py-8 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-white/40">
          <span>Made with</span>
          <span className="text-[#FF4500]">❤️</span>
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
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
