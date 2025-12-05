import { Heart, Coffee, Info } from 'lucide-react';

export default function Support() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-teal-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Support Antyqra</h2>
          </div>

          <div className="space-y-6">
            <p className="text-slate-300 text-lg leading-relaxed">
              Antyqra is a bootstrapped student project — no big company, no sponsors.
              If Antyqra helps you understand the markets better, you can support the project and help cover server costs, data APIs, and new features.
            </p>

            <div className="flex justify-center">
              <a
                href="https://buymeacoffee.com/tckrboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 rounded-xl transition-all hover:scale-105 shadow-lg max-w-md w-full"
              >
                <Coffee className="w-6 h-6 text-slate-900" />
                <span className="font-bold text-slate-900 text-lg">Support</span>
              </a>
            </div>

            <div className="flex items-start space-x-4 p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
              <Info className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-slate-300 text-sm leading-relaxed">
                  <span className="font-bold text-white">Transparency:</span> Your support doesn't buy
                  financial advice or guaranteed returns. It simply helps keep Antyqra online and improving.
                </p>
                <p className="text-slate-400 text-xs">
                  <span className="font-bold text-slate-300">Use of funds:</span> Contributions go toward hosting, market-data APIs, and development time.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Other Ways to Help</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Share Antyqra with other investors and traders</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Send feedback or feature ideas through our contact form</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Follow us on social media for updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-slate-300 text-lg">
            Thank you for using Antyqra and helping make financial data accessible to everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
