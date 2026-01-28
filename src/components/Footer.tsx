export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Clawdytest
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://clawd.bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
            >
              Clawd.bot
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
            >
              Terms
            </a>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Clawdytest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
