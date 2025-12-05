import { useEffect, useState } from 'react';
import { TrendingUp, Newspaper, BookOpen, Brain, Flame, Zap, Sparkles, Coins, Info, Heart, UserCircle, LogOut, LogIn } from 'lucide-react';
import SearchBar from './components/SearchBar';
import StockDetails from './components/StockDetails';
import MarketOverview from './components/MarketOverview';
import NewsSection from './components/NewsSection';
import MarketInsights from './components/MarketInsights';
import BreakingNews from './components/BreakingNews';
import LearningSection from './components/LearningSection';
import QuizSection from './components/QuizSection';
import LiveNewsFeed from './components/LiveNewsFeed';
import MarketSentiment from './components/MarketSentiment';
import NewsSidebar from './components/NewsSidebar';
import TodaysMovers from './components/TodaysMovers';
import NewsImpact from './components/NewsImpact';
import Watchlist from './components/Watchlist';
import MarketGalaxy from './components/MarketGalaxy';
import CryptoWatcher from './components/CryptoWatcher';
import About from './components/About';
import Support from './components/Support';
import PaperTrading from './components/PaperTrading';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

function App() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    'home' | 'paper' | 'news' | 'movers' | 'impact' | 'learn' | 'quiz' | 'galaxy' | 'crypto' | 'about' | 'support'
  >('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }, [theme]);

  const handleSearch = (symbol: string) => {
    setSelectedStock(symbol);
    setCurrentView('home');
  };

  const handleNavClick = (
    view: 'home' | 'paper' | 'news' | 'movers' | 'impact' | 'learn' | 'quiz' | 'galaxy' | 'crypto' | 'about' | 'support'
  ) => {
    setCurrentView(view);
    if (view === 'home') {
      setSelectedStock(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-orange-500/20 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-3 lg:mb-0">
            <button onClick={() => handleNavClick('home')} className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
              <div className="text-orange-400 font-black text-2xl sm:text-3xl tracking-tight">
                Antyqra™
              </div>
              <div className="h-5 sm:h-6 w-px bg-slate-700 hidden sm:block"></div>
              <span className="text-slate-400 text-xs sm:text-sm font-medium hidden sm:inline">Live Market Data</span>
            </button>

            <div className="hidden lg:flex items-center space-x-2">
              <NavButton
                icon={TrendingUp}
                label="Markets"
                active={currentView === 'home'}
                onClick={() => handleNavClick('home')}
              />
              <NavButton
                icon={Flame}
                label="Movers"
                active={currentView === 'movers'}
                onClick={() => handleNavClick('movers')}
              />
              <NavButton
                icon={Zap}
                label="Impact"
                active={currentView === 'impact'}
                onClick={() => handleNavClick('impact')}
              />
              <NavButton
                icon={Brain}
                label="Paper Trading"
                active={currentView === 'paper'}
                onClick={() => handleNavClick('paper')}
              />
              <NavButton
                icon={Newspaper}
                label="News"
                active={currentView === 'news'}
                onClick={() => handleNavClick('news')}
              />
              <NavButton
                icon={BookOpen}
                label="Learn"
                active={currentView === 'learn'}
                onClick={() => handleNavClick('learn')}
              />
              <NavButton
                icon={Brain}
                label="Quiz"
                active={currentView === 'quiz'}
                onClick={() => handleNavClick('quiz')}
              />
              <NavButton
                icon={Sparkles}
                label="Galaxy"
                active={currentView === 'galaxy'}
                onClick={() => handleNavClick('galaxy')}
              />
              <NavButton
                icon={Coins}
                label="Crypto"
                active={currentView === 'crypto'}
                onClick={() => handleNavClick('crypto')}
              />
              <div className="h-6 w-px bg-slate-700 mx-1"></div>
              <NavButton
                icon={Info}
                label="About"
                active={currentView === 'about'}
                onClick={() => handleNavClick('about')}
              />
              <NavButton
                icon={Heart}
                label="Support"
                active={currentView === 'support'}
                onClick={() => handleNavClick('support')}
              />
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="ml-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400/60 transition-colors text-xs font-semibold"
              >
                {theme === 'light' ? 'Dark' : 'Light'} Mode
              </button>
              {user ? (
                <div className="flex items-center gap-2 ml-2">
                  <div className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    <span className="max-w-[140px] truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-100 hover:bg-rose-500/30 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold text-xs hover:from-orange-600 hover:to-yellow-600 inline-flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Save progress
                </button>
              )}
            </div>
          </div>

          <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex items-center space-x-2 min-w-max pb-1">
              <MobileNavButton
                icon={TrendingUp}
                label="Markets"
                active={currentView === 'home'}
                onClick={() => handleNavClick('home')}
              />
              <MobileNavButton
                icon={Flame}
                label="Movers"
                active={currentView === 'movers'}
                onClick={() => handleNavClick('movers')}
              />
              <MobileNavButton
                icon={Zap}
                label="Impact"
                active={currentView === 'impact'}
                onClick={() => handleNavClick('impact')}
              />
              <MobileNavButton
                icon={Brain}
                label="Paper"
                active={currentView === 'paper'}
                onClick={() => handleNavClick('paper')}
              />
              <MobileNavButton
                icon={Newspaper}
                label="News"
                active={currentView === 'news'}
                onClick={() => handleNavClick('news')}
              />
              <MobileNavButton
                icon={BookOpen}
                label="Learn"
                active={currentView === 'learn'}
                onClick={() => handleNavClick('learn')}
              />
              <MobileNavButton
                icon={Brain}
                label="Quiz"
                active={currentView === 'quiz'}
                onClick={() => handleNavClick('quiz')}
              />
              <MobileNavButton
                icon={Sparkles}
                label="Galaxy"
                active={currentView === 'galaxy'}
                onClick={() => handleNavClick('galaxy')}
              />
              <MobileNavButton
                icon={Coins}
                label="Crypto"
                active={currentView === 'crypto'}
                onClick={() => handleNavClick('crypto')}
              />
              <MobileNavButton
                icon={Info}
                label="About"
                active={currentView === 'about'}
                onClick={() => handleNavClick('about')}
              />
              <MobileNavButton
                icon={Heart}
                label="Support"
                active={currentView === 'support'}
                onClick={() => handleNavClick('support')}
              />
            </div>
          </div>
        </div>
      </nav>

      <LiveNewsFeed />

      <main className="bg-slate-950">
        {currentView === 'home' && (
          <div>
            {!selectedStock && (
              <div className="bg-gradient-to-br from-orange-600 to-yellow-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center space-x-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-orange-50 text-sm font-semibold">Live Market Data</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight text-white">
                      Antyqra – Real-Time Stock Market Intelligence Dashboard
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-orange-50 mb-8 sm:mb-10 font-medium">
                      Track stocks, analyze sentiment, and stay ahead with live data, news, and alerts.
                    </p>
                    <SearchBar onSearch={handleSearch} />
                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="text-orange-100 text-sm font-medium">Popular:</span>
                      {['AAPL', 'TSLA', 'NVDA', 'MSFT'].map((symbol) => (
                        <button
                          key={symbol}
                          onClick={() => handleSearch(symbol)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg text-white text-sm font-semibold transition-all"
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
              </div>
            )}

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {selectedStock ? (
                    <StockDetails symbol={selectedStock} />
                  ) : (
                    <>
                      <MarketSentiment />
                      <Watchlist onStockSelect={handleSearch} />
                      <TodaysMovers />
                      <MarketOverview />
                      <BreakingNews />
                      <MarketInsights />

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Popular Stocks</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'META', 'GOOGL', 'AMZN', 'AMD', 'NFLX', 'DIS'].map((symbol) => (
                            <button
                              key={symbol}
                              onClick={() => handleSearch(symbol)}
                              className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-800 active:bg-orange-500 lg:hover:bg-orange-500 border border-slate-700 active:border-orange-400 lg:hover:border-orange-400 rounded-xl font-bold text-white transition-all lg:hover:scale-105 touch-manipulation text-sm sm:text-base"
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="hidden lg:block">
                  <NewsSidebar />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'movers' && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <TodaysMovers />
                <MarketInsights />
              </div>
              <div className="hidden lg:block">
                <NewsSidebar />
              </div>
            </div>
          </div>
        )}

        {currentView === 'impact' && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
              <NewsImpact />
              <div className="hidden lg:block">
                <NewsSidebar />
              </div>
            </div>
          </div>
        )}

        {currentView === 'news' && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
              <NewsSection />
              <div className="hidden lg:block">
                <NewsSidebar />
              </div>
            </div>
          </div>
        )}
        {currentView === 'paper' && (
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <PaperTrading />
          </div>
        )}
        {currentView === 'learn' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <LearningSection />
          </div>
        )}
        {currentView === 'quiz' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <QuizSection />
          </div>
        )}
        {currentView === 'galaxy' && (
          <MarketGalaxy />
        )}
        {currentView === 'crypto' && (
          <CryptoWatcher />
        )}
        {currentView === 'about' && (
          <About onNavigateToSupport={() => handleNavClick('support')} />
        )}
        {currentView === 'support' && (
          <Support />
        )}
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <footer className="bg-slate-900 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button
                onClick={() => handleNavClick('about')}
                className="text-slate-400 hover:text-orange-400 transition-colors font-medium"
              >
                About Antyqra
              </button>
              <button
                onClick={() => handleNavClick('support')}
                className="text-slate-400 hover:text-orange-400 transition-colors font-medium"
              >
                Support the Project
              </button>
              <span className="text-slate-400 font-medium">
                Disclaimer – Not Financial Advice
              </span>
            </div>

            <div className="text-center space-y-3">
              <p className="text-slate-400 text-sm">
                Powered by <span className="text-orange-400 font-semibold">Finnhub API</span> - Real-time market data
              </p>
              <p className="text-slate-600 text-sm font-semibold">
                © 2025 Antyqra™ – All rights reserved
              </p>
              <p className="text-slate-500 text-xs max-w-3xl mx-auto">
                Antyqra provides tools and market data for informational and educational purposes only and does not offer investment, trading, or financial advice.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/50'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function MobileNavButton({ icon: Icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap touch-manipulation ${
        active
          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/30'
          : 'bg-slate-800 text-slate-400 active:bg-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default App;
