"use client";

import { useState, useMemo } from "react";
import { newsData, Category } from "@/data/news";
import NewsCard from "./NewsCard";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";

export default function NewsFeed() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const filteredNews = useMemo(() => {
    return newsData.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.snippet.toLowerCase().includes(search.toLowerCase()) ||
        item.source.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <section id="news" className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Stories
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the newest tutorials, announcements, and community highlights
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="lg:w-80">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="flex-1">
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>
        </div>

        {filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No stories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredNews.length} of {newsData.length} stories
        </div>
      </div>
    </section>
  );
}
