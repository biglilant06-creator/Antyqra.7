import { Info, CheckCircle, XCircle, Heart } from 'lucide-react';

interface AboutProps {
  onNavigateToSupport?: () => void;
}

export default function About({ onNavigateToSupport }: AboutProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-teal-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Who We Are</h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-teal-400">About Antyqra</h3>
            <p className="text-slate-300 leading-relaxed">
              Antyqra is an independent project built by a college student who was tired of clunky,
              overcomplicated stock tools. Our goal is to give everyday investors a clean, real-time
              view of the market so they can understand what's happening without needing a Wall Street terminal.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">What We Do (and Don't Do)</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>What Antyqra Does</span>
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Streams live market data and sentiment</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Helps you track tickers and news in one place</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Shows information for education and research</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-400 flex items-center space-x-2">
                <XCircle className="w-5 h-5" />
                <span>What Antyqra Does Not Do</span>
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">We don't execute trades</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">We don't manage money</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">We don't give personalized financial advice</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="font-bold text-white">Important:</span> Antyqra is an informational tool only.
              Always do your own research before making any investment decisions.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 border border-teal-500/30 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Like Antyqra?</h3>
              <p className="text-slate-300">
                If you'd like to help Antyqra grow, you can{' '}
                {onNavigateToSupport ? (
                  <button
                    onClick={onNavigateToSupport}
                    className="text-teal-400 hover:text-teal-300 font-semibold underline"
                  >
                    support the project
                  </button>
                ) : (
                  <span className="text-teal-400 font-semibold">support the project</span>
                )}{' '}
                or share it with a friend who trades.
              </p>
            </div>
            <Heart className="w-12 h-12 text-teal-400 opacity-50 flex-shrink-0 ml-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
