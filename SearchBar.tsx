import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (symbol: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.toUpperCase().trim());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-stretch gap-2 sm:gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ticker (e.g., AAPL)"
          className="w-full pl-11 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 lg:py-5 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-orange-400/50 text-base sm:text-lg font-medium shadow-xl touch-manipulation"
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-5 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-orange-400 to-yellow-400 active:from-orange-500 active:to-yellow-500 lg:hover:from-orange-500 lg:hover:to-yellow-500 disabled:bg-slate-700 text-slate-900 disabled:text-slate-500 font-black rounded-xl sm:rounded-2xl transition-all disabled:cursor-not-allowed shadow-xl lg:hover:scale-105 active:scale-95 text-base sm:text-lg touch-manipulation"
      >
        Search
      </button>
    </form>
  );
}
