import { useState } from 'react';
import { BookOpen, TrendingUp, PieChart, Shield, Lightbulb, Target, X, ChevronRight, CheckCircle } from 'lucide-react';

interface Lesson {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estMinutes: number;
  skills: string[];
  topics: Array<{
    title: string;
    content: string[];
  }>;
}

export default function LearningSection() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const lessons: Lesson[] = [
    {
      icon: BookOpen,
      title: "Stock Market Basics",
      description: "Learn the fundamentals of how stock markets work, including buying, selling, and the role of exchanges.",
      difficulty: "Beginner",
      estMinutes: 12,
      skills: ["Market structure", "Order types", "Liquidity"],
      topics: [
        {
          title: "What is a Stock?",
          content: [
            "A stock represents ownership in a company. When you buy a stock, you become a shareholder.",
            "Companies issue stocks to raise capital for growth, operations, and expansion.",
            "Stock prices fluctuate based on supply and demand, company performance, and market conditions.",
            "Stocks are traded on exchanges like NYSE, NASDAQ, and others around the world."
          ]
        },
        {
          title: "Stock Exchanges",
          content: [
            "Stock exchanges are marketplaces where buyers and sellers trade stocks.",
            "The New York Stock Exchange (NYSE) is the largest stock exchange by market cap.",
            "NASDAQ is known for technology stocks and electronic trading.",
            "Exchanges ensure fair, transparent, and orderly trading with regulated rules."
          ]
        },
        {
          title: "Market Orders vs Limit Orders",
          content: [
            "A market order executes immediately at the current market price.",
            "A limit order sets a specific price at which you want to buy or sell.",
            "Market orders guarantee execution but not price; limit orders guarantee price but not execution.",
            "Stop-loss orders automatically sell when a stock hits a certain price to limit losses."
          ]
        },
        {
          title: "Bid-Ask Spread",
          content: [
            "The bid is the highest price a buyer is willing to pay for a stock.",
            "The ask is the lowest price a seller is willing to accept.",
            "The spread is the difference between bid and ask prices.",
            "Narrow spreads indicate high liquidity; wide spreads suggest lower trading volume."
          ]
        }
      ]
    },
    {
      icon: BookOpen,
      title: "Options Foundations",
      description: "Grasp the building blocks of calls, puts, and how options move with the underlying.",
      difficulty: "Intermediate",
      estMinutes: 15,
      skills: ["Calls/Puts", "Greeks", "Break-evens"],
      topics: [
        {
          title: "Call vs Put Basics",
          content: [
            "Calls give the right to buy; puts give the right to sell at the strike price before expiry.",
            "Option premium = intrinsic value + time value.",
            "Out-of-the-money options are pure time value; intrinsic value grows as price moves in-the-money."
          ]
        },
        {
          title: "How Options Move",
          content: [
            "Delta shows how much an option price should change per $1 move in the stock.",
            "Gamma measures how fast delta changes; it’s highest near-the-money close to expiry.",
            "Theta is time decay, typically negative for long options."
          ]
        },
        {
          title: "Volatility Impact",
          content: [
            "Vega shows sensitivity to implied volatility (IV); rising IV lifts option premiums.",
            "Earnings events often lift IV before the report and crush IV after results.",
            "Compare IV to historical volatility to judge expensiveness."
          ]
        },
        {
          title: "Simple Strategies",
          content: [
            "Covered calls generate income on stock you own but cap upside.",
            "Cash-secured puts can be a way to get paid while waiting to buy at a lower strike.",
            "Long call or put spreads reduce cost and define risk compared to naked longs."
          ]
        }
      ]
    },
    {
      icon: PieChart,
      title: "Macro & Rates Playbook",
      description: "Connect economic releases, inflation, and rate moves to sector performance and style rotations.",
      difficulty: "Advanced",
      estMinutes: 14,
      skills: ["Macro", "Rates", "Sector tilts"],
      topics: [
        {
          title: "Key Macro Prints",
          content: [
            "CPI/PCE measure inflation; hotter prints push yields up and pressure growth stocks.",
            "Jobs (NFP) and unemployment set the tone for consumer strength and Fed policy path.",
            "ISM PMI signals manufacturing health; 50+ implies expansion."
          ]
        },
        {
          title: "Yield Curve Signals",
          content: [
            "Inversions (2s/10s) often precede slowdowns; steepening can signal re-acceleration or late-cycle.",
            "Rising real yields often weigh on long-duration assets (growth, high multiple tech).",
            "Falling yields usually aid rate-sensitive sectors (REITs, utilities) and growth equities."
          ]
        },
        {
          title: "Sector & Style Rotation",
          content: [
            "Value tends to outperform when rates rise moderately and inflation is firm.",
            "Growth benefits from falling yields and lower discount rates.",
            "Cyclicals (industrials, materials) often lead during early-cycle rebounds."
          ]
        },
        {
          title: "Playbook Building",
          content: [
            "Align trades with macro trend: overweight sectors that benefit, underweight those that lag.",
            "Watch the dollar: a stronger USD can pressure commodities and multinationals’ earnings.",
            "Pair macro view with risk controls—size positions and define invalidation levels."
          ]
        }
      ]
    },
    {
      icon: TrendingUp,
      title: "Technical Analysis",
      description: "Understand chart patterns, indicators, and how to read price movements to make informed decisions.",
      difficulty: "Intermediate",
      estMinutes: 14,
      skills: ["Charts", "Momentum", "Price action"],
      topics: [
        {
          title: "Candlestick Charts",
          content: [
            "Candlesticks show opening, closing, high, and low prices for a time period.",
            "Green/white candles indicate the price closed higher than it opened (bullish).",
            "Red/black candles show the price closed lower than it opened (bearish).",
            "Patterns like doji, hammer, and engulfing can signal trend reversals."
          ]
        },
        {
          title: "Support and Resistance",
          content: [
            "Support is a price level where buying interest prevents further decline.",
            "Resistance is a price level where selling pressure prevents further rise.",
            "Breaking through support often leads to further downward movement.",
            "Breaking resistance typically signals continued upward momentum."
          ]
        },
        {
          title: "Moving Averages",
          content: [
            "Simple Moving Average (SMA) calculates the average price over a specific period.",
            "Exponential Moving Average (EMA) gives more weight to recent prices.",
            "The 50-day and 200-day moving averages are commonly watched indicators.",
            "When short-term MA crosses above long-term MA, it's called a 'golden cross' (bullish signal)."
          ]
        },
        {
          title: "RSI and MACD",
          content: [
            "RSI (Relative Strength Index) measures momentum on a scale of 0-100.",
            "RSI above 70 suggests overbought conditions; below 30 suggests oversold.",
            "MACD shows the relationship between two moving averages.",
            "MACD crossovers and divergences can signal trend changes and momentum shifts."
          ]
        }
      ]
    },
    {
      icon: PieChart,
      title: "Portfolio Diversification",
      description: "Master the art of spreading risk across different assets, sectors, and investment vehicles.",
      difficulty: "Intermediate",
      estMinutes: 12,
      skills: ["Asset mix", "Rebalancing", "Sector spread"],
      topics: [
        {
          title: "Why Diversify?",
          content: [
            "Diversification reduces risk by spreading investments across different assets.",
            "It protects against major losses if one investment performs poorly.",
            "The goal is to balance risk and reward across your entire portfolio.",
            "A well-diversified portfolio can provide more consistent returns over time."
          ]
        },
        {
          title: "Asset Allocation",
          content: [
            "Asset allocation divides your portfolio among stocks, bonds, cash, and other assets.",
            "Your allocation should match your risk tolerance, goals, and time horizon.",
            "Younger investors typically hold more stocks for growth potential.",
            "As you near retirement, shift toward bonds and stable income investments."
          ]
        },
        {
          title: "Sector Diversification",
          content: [
            "Invest across different sectors: technology, healthcare, finance, energy, etc.",
            "Different sectors perform well in different economic conditions.",
            "Avoid concentration in one sector, even if it's currently performing well.",
            "Sector rotation strategies adapt to changing economic cycles."
          ]
        },
        {
          title: "Rebalancing Your Portfolio",
          content: [
            "Rebalancing brings your portfolio back to target allocations.",
            "Do this periodically (quarterly or annually) or when allocations drift significantly.",
            "Sell overperforming assets and buy underperforming ones to maintain balance.",
            "Rebalancing forces you to 'buy low and sell high' systematically."
          ]
        }
      ]
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Learn strategies to protect your capital and manage potential losses in volatile markets.",
      difficulty: "Beginner",
      estMinutes: 10,
      skills: ["Stops", "Sizing", "Risk/Reward"],
      topics: [
        {
          title: "Understanding Risk",
          content: [
            "All investments carry risk - the possibility of losing money.",
            "Higher potential returns typically come with higher risk.",
            "Market risk affects all stocks; company-specific risk affects individual stocks.",
            "Your risk tolerance depends on your age, goals, and financial situation."
          ]
        },
        {
          title: "Stop-Loss Orders",
          content: [
            "A stop-loss automatically sells a stock when it reaches a predetermined price.",
            "This limits your downside and protects against major losses.",
            "Set stop-losses based on technical levels or percentage thresholds (e.g., 10%).",
            "Trailing stop-losses move up with the stock price to lock in gains."
          ]
        },
        {
          title: "Position Sizing",
          content: [
            "Don't invest too much in any single stock - typically no more than 5-10% per position.",
            "Larger positions increase both potential gains and potential losses.",
            "Size positions based on conviction level and risk assessment.",
            "Keep enough cash reserves for opportunities and emergencies."
          ]
        },
        {
          title: "Risk-Reward Ratio",
          content: [
            "Calculate potential profit versus potential loss before entering a trade.",
            "A 3:1 ratio means you're risking $1 to potentially make $3.",
            "Only take trades with favorable risk-reward ratios (typically 2:1 or better).",
            "This ensures your winning trades more than compensate for losing ones."
          ]
        }
      ]
    },
    {
      icon: Lightbulb,
      title: "Fundamental Analysis",
      description: "Evaluate company value through financial statements, earnings, and economic indicators.",
      difficulty: "Advanced",
      estMinutes: 16,
      skills: ["Valuation", "Cash flow", "Earnings"],
      topics: [
        {
          title: "Price-to-Earnings (P/E) Ratio",
          content: [
            "P/E ratio = Stock Price ÷ Earnings Per Share (EPS).",
            "It shows how much investors are willing to pay per dollar of earnings.",
            "A high P/E may indicate growth expectations or overvaluation.",
            "Compare P/E ratios within the same industry for meaningful insights."
          ]
        },
        {
          title: "Earnings Per Share (EPS)",
          content: [
            "EPS = (Net Income - Dividends on Preferred Stock) ÷ Average Outstanding Shares.",
            "Higher EPS indicates greater profitability per share.",
            "Look for consistent EPS growth over multiple quarters and years.",
            "Compare actual EPS to analyst estimates - beats are often rewarded with price increases."
          ]
        },
        {
          title: "Reading Balance Sheets",
          content: [
            "Balance sheets show a company's assets, liabilities, and shareholders' equity.",
            "Assets include cash, inventory, property, and investments.",
            "Liabilities are debts and obligations the company must pay.",
            "Strong companies have more assets than liabilities and manageable debt levels."
          ]
        },
        {
          title: "Cash Flow Analysis",
          content: [
            "Cash flow shows actual money moving in and out of the business.",
            "Operating cash flow indicates cash generated from core operations.",
            "Free cash flow = Operating Cash Flow - Capital Expenditures.",
            "Positive and growing cash flow is essential for long-term sustainability."
          ]
        }
      ]
    },
    {
      icon: Target,
      title: "Investment Strategies",
      description: "Explore different approaches to investing, from value investing to growth strategies.",
      difficulty: "Intermediate",
      estMinutes: 12,
      skills: ["Value vs growth", "Dividends", "Indexing"],
      topics: [
        {
          title: "Value Investing",
          content: [
            "Value investing focuses on buying undervalued stocks trading below intrinsic value.",
            "Look for low P/E ratios, high dividend yields, and strong fundamentals.",
            "Warren Buffett popularized this approach - buy quality companies on sale.",
            "Requires patience as the market may take time to recognize true value."
          ]
        },
        {
          title: "Growth Investing",
          content: [
            "Growth investors buy companies with above-average earnings growth potential.",
            "These stocks often have high P/E ratios due to future expectations.",
            "Focus on revenue growth, market share expansion, and innovative products.",
            "Tech companies and emerging industries often fit the growth profile."
          ]
        },
        {
          title: "Dividend Investing",
          content: [
            "Dividend stocks provide regular income through quarterly payments.",
            "Look for companies with a history of consistent and growing dividends.",
            "Dividend yield = Annual Dividend ÷ Stock Price.",
            "Dividend aristocrats have increased dividends for 25+ consecutive years."
          ]
        },
        {
          title: "Index Fund Investing",
          content: [
            "Index funds track market indices like S&P 500, providing instant diversification.",
            "Very low fees compared to actively managed funds.",
            "Historically, index funds outperform most active fund managers long-term.",
            "Great for beginners and passive investors seeking market returns."
          ]
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Intermediate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Advanced':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (selectedLesson) {
    const Icon = selectedLesson.icon;
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-6 bg-slate-900/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl">
                  <Icon className="w-8 h-8 text-teal-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedLesson.title}</h2>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(selectedLesson.difficulty)}`}>
                      {selectedLesson.difficulty}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300 bg-slate-800/80">
                      {selectedLesson.estMinutes} min focus
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm sm:text-base">{selectedLesson.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            {selectedLesson.topics.map((topic, index) => (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-teal-500/20 border border-teal-500/30 rounded-lg">
                    <span className="text-teal-400 font-black">{index + 1}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{topic.title}</h3>
                </div>
                <div className="space-y-3 ml-11">
                  {topic.content.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setSelectedLesson(null)}
              className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Back to All Lessons
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
          Learn to Invest
          <span className="block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Like a Pro
          </span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
          Master the fundamentals, then level up with options, macro playbooks, and risk-first investing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {lessons.map((lesson, index) => {
          const Icon = lesson.icon;
          return (
            <button
              key={index}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 hover:bg-slate-800 hover:border-teal-500/50 transition-all group text-left w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/30 group-hover:bg-teal-500/30 transition-colors">
                  <Icon className="w-6 h-6 text-teal-400" />
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(lesson.difficulty)}`}>
                  {lesson.difficulty}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                {lesson.title}
              </h3>

              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {lesson.description}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">{lesson.topics.length} topics</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">{lesson.estMinutes} min</span>
                </div>
                <ChevronRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {lesson.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-800 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
