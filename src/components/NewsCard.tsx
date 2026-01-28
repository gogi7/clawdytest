import { NewsItem } from "@/data/news";

interface NewsCardProps {
  item: NewsItem;
}

const categoryColors: Record<string, string> = {
  Tutorials: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
  Announcements: "bg-green-500/10 text-green-500 dark:text-green-400",
  Community: "bg-orange-500/10 text-orange-500 dark:text-orange-400",
  Integrations: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
  "AI News": "bg-pink-500/10 text-pink-500 dark:text-pink-400",
};

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <article className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryColors[item.category] || "bg-gray-500/10 text-gray-500"}`}
          >
            {item.category}
          </span>
          <time className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
          {item.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {item.snippet}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {item.source}
          </span>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            Read more
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
