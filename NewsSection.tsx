import { useEffect, useMemo, useState } from 'react';
import { Loader2, Newspaper, Globe, TrendingUp, AlertTriangle, CheckSquare, Filter } from 'lucide-react';
import * as stockApi from '../services/stockApi';

export default function NewsSection() {
  const [loading, setLoading] = useState(true);
  const [marketNews, setMarketNews] = useState<stockApi.MarketNews[]>([]);
  const [geopoliticalNews, setGeopoliticalNews] = useState<stockApi.MarketNews[]>([]);
  const [activeTab, setActiveTab] = useState<'market' | 'geopolitical'>('market');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const availableTopics = [
    'tech',
    'energy',
    'economy',
    'rates',
    'earnings',
    'crypto',
    'china',
    'policy',
    'inflation',
    'ai',
    'defense'
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const allNews = await stockApi.getMarketNews('general');

        const geopoliticalKeywords = [
          'china', 'russia', 'ukraine', 'war', 'conflict', 'sanctions',
          'tariff', 'trade war', 'nato', 'europe', 'middle east',
          'israel', 'iran', 'taiwan', 'geopolitical', 'election',
          'biden', 'trump', 'congress', 'senate', 'policy',
          'brexit', 'eu', 'diplomacy', 'treaty', 'military',
          'north korea', 'south china sea', 'embargo', 'allies'
        ];

        const geoNews: stockApi.MarketNews[] = [];
        const mktNews: stockApi.MarketNews[] = [];

        allNews.forEach(article => {
          const content = (article.headline + ' ' + article.summary).toLowerCase();
          const isGeopolitical = geopoliticalKeywords.some(keyword =>
            content.includes(keyword)
          );

          if (isGeopolitical) {
            geoNews.push(article);
          } else {
            mktNews.push(article);
          }
        });

        setGeopoliticalNews(geoNews);
        setMarketNews(mktNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const filteredMarketNews = useMemo(() => {
    if (!selectedTopics.length) return marketNews;
    return marketNews.filter((article) => {
      const content = (article.headline + ' ' + article.summary + ' ' + (article.related || '')).toLowerCase();
      return selectedTopics.some((topic) => content.includes(topic.toLowerCase()));
    });
  }, [marketNews, selectedTopics]);

  const filteredGeoNews = useMemo(() => {
    if (!selectedTopics.length) return geopoliticalNews;
    return geopoliticalNews.filter((article) => {
      const content = (article.headline + ' ' + article.summary + ' ' + (article.related || '')).toLowerCase();
      return selectedTopics.some((topic) => content.includes(topic.toLowerCase()));
    });
  }, [geopoliticalNews, selectedTopics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto" />
          <p className="text-slate-400">Loading real-time news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <Newspaper className="w-8 h-8 text-teal-400" />
            <h2 className="text-3xl font-bold text-white">News Center</h2>
          </div>

          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('market')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'market'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Market News
              <span className="px-2 py-0.5 bg-slate-900 rounded text-xs font-bold">
                {filteredMarketNews.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('geopolitical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'geopolitical'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Geopolitical
              <span className="px-2 py-0.5 bg-slate-900 rounded text-xs font-bold">
                {filteredGeoNews.length}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
            <Filter className="w-4 h-4 text-teal-300" />
            Choose topics to focus (optional)
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTopics.map((topic) => {
              const active = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    active
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-100'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-teal-400/40'
                  }`}
                >
                  <CheckSquare className={`w-4 h-4 ${active ? 'text-teal-300' : 'text-slate-400'}`} />
                  <span className="capitalize">{topic}</span>
                </button>
              );
            })}
            <button
              onClick={() => setSelectedTopics([])}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:border-teal-400/40 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'market' ? (
          filteredMarketNews.length > 0 ? (
            filteredMarketNews.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:bg-slate-800/50 hover:border-teal-500/50 transition-all"
              >
                {article.image && (
                  <div className="aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={article.image}
                      alt={article.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-teal-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg group-hover:text-teal-400 transition-colors line-clamp-2">
                      {article.headline}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-400 font-semibold">{article.source}</span>
                    <span className="text-slate-500">
                      {new Date(article.datetime * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg font-semibold">No market news available</p>
              <p className="text-slate-500 text-sm">Check back soon for updates</p>
            </div>
          )
        ) : (
          filteredGeoNews.length > 0 ? (
            filteredGeoNews.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden hover:bg-slate-800/50 hover:border-amber-500/50 transition-all"
              >
                {article.image && (
                  <div className="aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={article.image}
                      alt={article.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors line-clamp-2">
                      {article.headline}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-semibold">{article.source}</span>
                    <span className="text-slate-500">
                      {new Date(article.datetime * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <Globe className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg font-semibold">No geopolitical news available</p>
              <p className="text-slate-500 text-sm">Check back soon for updates</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
