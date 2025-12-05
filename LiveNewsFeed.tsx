import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getMarketNews, MarketNews } from '../services/stockApi';

export default function LiveNewsFeed() {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await getMarketNews('general');
        setNews(newsData);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (loading || news.length === 0) {
    return null;
  }

  const currentArticle = news[currentIndex];

  return (
    <div className="bg-rose-600 border-b border-rose-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-rose-700 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider">Breaking</span>
          </div>

          <div className="flex-1 overflow-hidden min-w-0">
            <a
              href={currentArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between group touch-manipulation"
            >
              <div className="flex-1 animate-slideIn min-w-0">
                <p className="text-white font-medium text-xs sm:text-sm truncate active:text-rose-100 lg:group-hover:text-rose-100 transition-colors">
                  {currentArticle.headline}
                </p>
              </div>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-rose-200 active:text-white lg:group-hover:text-white transition-colors ml-2 sm:ml-4 flex-shrink-0" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {news.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex % 5
                    ? 'w-6 bg-white'
                    : 'w-1 bg-rose-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
