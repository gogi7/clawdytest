import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NewsFeed from "@/components/NewsFeed";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <main>
        <Hero />
        <NewsFeed />
      </main>
      <Footer />
    </div>
  );
}
