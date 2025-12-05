import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Award, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuizSection() {
  const quizzes: Array<{title: string; difficulty: string; questions: Question[]}> = [
    {
      title: "Stock Market Fundamentals",
      difficulty: "Beginner",
      questions: [
        {
          question: "What does P/E ratio stand for?",
          options: ["Price to Equity", "Price to Earnings", "Profit to Equity", "Profit to Earnings"],
          correctAnswer: 1,
          explanation: "P/E ratio stands for Price-to-Earnings ratio, which compares a company's stock price to its earnings per share."
        },
        {
          question: "What is a bull market?",
          options: [
            "A market where prices are falling",
            "A market where prices are rising",
            "A market with high volatility",
            "A market with low trading volume"
          ],
          correctAnswer: 1,
          explanation: "A bull market refers to a market condition where prices are rising or expected to rise, typically by 20% or more."
        },
        {
          question: "What does IPO stand for?",
          options: [
            "Initial Price Offering",
            "Initial Public Offering",
            "Internal Price Order",
            "Investment Portfolio Option"
          ],
          correctAnswer: 1,
          explanation: "IPO stands for Initial Public Offering, when a private company offers its shares to the public for the first time."
        }
      ]
    },
    {
      title: "Technical Analysis Basics",
      difficulty: "Intermediate",
      questions: [
        {
          question: "What does RSI measure?",
          options: [
            "Revenue and Sales Index",
            "Relative Strength Index (momentum)",
            "Return on Stock Investment",
            "Risk Sensitivity Indicator"
          ],
          correctAnswer: 1,
          explanation: "RSI (Relative Strength Index) measures the momentum of price movements, indicating overbought or oversold conditions."
        },
        {
          question: "What is a candlestick chart used for?",
          options: [
            "Only showing closing prices",
            "Showing open, high, low, and close prices",
            "Displaying company logos",
            "Tracking dividends"
          ],
          correctAnswer: 1,
          explanation: "Candlestick charts display the open, high, low, and close prices for a specific time period, helping traders analyze price action."
        },
        {
          question: "What does a moving average help identify?",
          options: [
            "Company earnings",
            "Price trends and support/resistance",
            "Dividend payments",
            "Market cap changes"
          ],
          correctAnswer: 1,
          explanation: "Moving averages smooth out price data to help identify trends and potential support or resistance levels."
        }
      ]
    },
    {
      title: "Saving & Roth IRA Essentials",
      difficulty: "Beginner",
      questions: [
        {
          question: "What is the primary advantage of a Roth IRA over a traditional IRA?",
          options: [
            "Higher contribution limits",
            "Tax-free withdrawals in retirement",
            "No income restrictions",
            "Immediate tax deduction"
          ],
          correctAnswer: 1,
          explanation: "Roth IRA contributions are made with after-tax dollars, but qualified withdrawals in retirement are completely tax-free, including all growth and earnings."
        },
        {
          question: "What is the recommended emergency fund amount for most households?",
          options: [
            "1-2 months of expenses",
            "3-6 months of expenses",
            "12 months of expenses",
            "Only $1,000"
          ],
          correctAnswer: 1,
          explanation: "Financial experts recommend saving 3-6 months of living expenses in an emergency fund to protect against job loss, medical emergencies, or unexpected expenses."
        },
        {
          question: "At what age can you withdraw Roth IRA earnings without penalties?",
          options: [
            "Age 55",
            "Age 59½ (and account open 5+ years)",
            "Age 65",
            "Any age without restrictions"
          ],
          correctAnswer: 1,
          explanation: "You can withdraw Roth IRA earnings tax-free and penalty-free after age 59½, provided the account has been open for at least 5 years. Contributions can be withdrawn anytime without penalty."
        },
        {
          question: "Why is starting to save early so important?",
          options: [
            "Banks give better rates to young savers",
            "Compound interest multiplies over time",
            "Inflation only affects older savers",
            "Tax rates are lower for young people"
          ],
          correctAnswer: 1,
          explanation: "Compound interest means your money earns returns, and those returns earn returns. Starting early gives your investments decades to grow exponentially through compounding."
        },
        {
          question: "What is the 2024 Roth IRA contribution limit for individuals under 50?",
          options: [
            "$5,000",
            "$6,500",
            "$7,000",
            "$10,000"
          ],
          correctAnswer: 2,
          explanation: "For 2024, individuals under 50 can contribute up to $7,000 to a Roth IRA. Those 50 and older can contribute an additional $1,000 as a catch-up contribution."
        }
      ]
    },
    {
      title: "Geopolitical News & Markets",
      difficulty: "Intermediate",
      questions: [
        {
          question: "How do geopolitical tensions typically affect financial markets?",
          options: [
            "They have no impact on markets",
            "They increase volatility and risk perception",
            "They only affect foreign stocks",
            "They always cause market crashes"
          ],
          correctAnswer: 1,
          explanation: "Geopolitical tensions increase market volatility as investors reassess risks. Uncertainty about conflicts, trade policies, or diplomatic relations leads to rapid price swings and defensive positioning."
        },
        {
          question: "Why is following international news important for U.S. investors?",
          options: [
            "U.S. stocks are isolated from global events",
            "Global supply chains and trade connect all markets",
            "Only day traders need international news",
            "International news doesn't affect the dollar"
          ],
          correctAnswer: 1,
          explanation: "Modern markets are deeply interconnected through global supply chains, trade relationships, and capital flows. Events in China, Europe, or emerging markets directly impact U.S. companies and stocks."
        },
        {
          question: "What market sector is most sensitive to Middle East tensions?",
          options: [
            "Technology stocks",
            "Energy and oil prices",
            "Retail companies",
            "Healthcare providers"
          ],
          correctAnswer: 1,
          explanation: "The Middle East produces a significant portion of global oil supply. Any conflict or tension in the region typically causes oil prices to spike due to supply concerns, affecting energy stocks and inflation."
        },
        {
          question: "How do central bank policy announcements affect markets globally?",
          options: [
            "Only domestic bonds are affected",
            "Interest rate changes ripple through global currencies and stocks",
            "Markets ignore central bank decisions",
            "Only gold prices change"
          ],
          correctAnswer: 1,
          explanation: "Central bank decisions, especially from the Federal Reserve, ECB, or Bank of Japan, affect global capital flows, currency values, and investment returns worldwide. Rate changes shift how money moves between countries."
        },
        {
          question: "Why should investors monitor trade policies and tariff news?",
          options: [
            "Tariffs are too small to matter",
            "Trade policies directly impact corporate profits and supply chains",
            "Only exporters are affected by tariffs",
            "Trade news is purely political"
          ],
          correctAnswer: 1,
          explanation: "Trade policies and tariffs directly affect company costs, profit margins, and supply chain efficiency. Industries like manufacturing, technology, and agriculture are especially sensitive to trade policy changes."
        }
      ]
    },
    {
      title: "Options & Greeks",
      difficulty: "Advanced",
      questions: [
        {
          question: "What does a positive delta mean for a call option?",
          options: [
            "The option loses value as the stock rises",
            "The option gains value as the stock rises",
            "The option is insensitive to stock moves",
            "The option only reacts to volatility changes"
          ],
          correctAnswer: 1,
          explanation: "Call options with positive delta gain value as the underlying stock price rises; delta approximates the option's price change per $1 move in the underlying."
        },
        {
          question: "What Greek measures sensitivity to implied volatility changes?",
          options: [
            "Delta",
            "Gamma",
            "Theta",
            "Vega"
          ],
          correctAnswer: 3,
          explanation: "Vega measures how much an option's price should change for a 1 percentage point change in implied volatility."
        },
        {
          question: "How does theta typically affect long option positions?",
          options: [
            "Time decay reduces option value over time",
            "Time decay increases option value over time",
            "Theta has no impact on options",
            "Theta only applies to deep ITM options"
          ],
          correctAnswer: 0,
          explanation: "Long option holders pay theta decay; option value tends to erode as time passes, all else equal."
        },
        {
          question: "Which strategy benefits from rising volatility and limited directional bias?",
          options: [
            "Long straddle",
            "Covered call",
            "Cash-secured put",
            "Short iron condor"
          ],
          correctAnswer: 0,
          explanation: "A long straddle (long call + long put at same strike/expiry) profits from large moves or rising implied volatility regardless of direction."
        }
      ]
    },
    {
      title: "Risk Management & Sizing",
      difficulty: "Intermediate",
      questions: [
        {
          question: "What is position sizing?",
          options: [
            "Choosing which broker to use",
            "Determining how much capital to allocate to a trade",
            "Picking which stocks to research",
            "Setting a price target"
          ],
          correctAnswer: 1,
          explanation: "Position sizing is the process of deciding how much capital to deploy in a specific position based on risk tolerance and stop levels."
        },
        {
          question: "If you risk 1% of your portfolio per trade, what is the max loss on a $10,000 account?",
          options: [
            "$10",
            "$50",
            "$100",
            "$500"
          ],
          correctAnswer: 2,
          explanation: "1% of a $10,000 account is $100; that's the maximum amount you would lose if the trade hits your stop."
        },
        {
          question: "Which tool directly limits downside on an open trade?",
          options: [
            "Limit order",
            "Trailing stop",
            "Market-on-open order",
            "Good-til-cancelled buy"
          ],
          correctAnswer: 1,
          explanation: "A trailing stop adjusts with favorable moves and triggers an exit if price reverses by the set amount, capping downside."
        },
        {
          question: "What does risk/reward 1:3 mean?",
          options: [
            "Risk is three times the potential reward",
            "Reward is three times the risk",
            "Risk and reward are equal",
            "The trade has a 33% win rate"
          ],
          correctAnswer: 1,
          explanation: "Risk/reward of 1:3 means you risk $1 to potentially make $3, a favorable ratio if win probability is reasonable."
        }
      ]
    },
    {
      title: "ETF & Index Investing",
      difficulty: "Beginner",
      questions: [
        {
          question: "What does ETF stand for?",
          options: [
            "Equity Trading Fund",
            "Exchange-Traded Fund",
            "Equity Transfer Facility",
            "Electronic Trust Fund"
          ],
          correctAnswer: 1,
          explanation: "ETF stands for Exchange-Traded Fund, a basket of securities that trades on an exchange like a stock."
        },
        {
          question: "Which ETF type tracks a broad market index like the S&P 500?",
          options: [
            "Sector ETF",
            "Broad index ETF",
            "Inverse ETF",
            "Commodity ETF"
          ],
          correctAnswer: 1,
          explanation: "Broad index ETFs (e.g., SPY, VOO) track large benchmarks like the S&P 500 to provide diversified market exposure."
        },
        {
          question: "What is an expense ratio?",
          options: [
            "A trading fee paid to your broker",
            "Annual fund operating costs as a % of assets",
            "A fee charged when you sell shares",
            "A penalty for holding too long"
          ],
          correctAnswer: 1,
          explanation: "Expense ratio represents a fund's annual operating costs as a percentage of its assets under management."
        },
        {
          question: "What is a key benefit of ETFs compared to mutual funds?",
          options: [
            "They only trade once per day",
            "They have guaranteed returns",
            "They can be bought/sold intraday like stocks",
            "They require high minimum investments"
          ],
          correctAnswer: 2,
          explanation: "ETFs trade throughout the day at market prices, offering flexibility similar to individual stocks."
        }
      ]
    },
    {
      title: "Economic Indicators & Rates",
      difficulty: "Intermediate",
      questions: [
        {
          question: "What does CPI measure?",
          options: [
            "Corporate profits index",
            "Consumer Price Index (inflation)",
            "Capital productivity indicator",
            "Currency purchasing index"
          ],
          correctAnswer: 1,
          explanation: "CPI tracks the average change over time in prices paid by consumers for a basket of goods and services, a key inflation gauge."
        },
        {
          question: "Why do rising interest rates often pressure growth stocks?",
          options: [
            "They reduce borrowing costs",
            "They increase the present value of future cash flows",
            "They decrease the present value of future cash flows",
            "They guarantee higher earnings"
          ],
          correctAnswer: 2,
          explanation: "Higher rates raise discount rates, reducing the present value of distant cash flows that growth stocks rely on."
        },
        {
          question: "Which indicator is a leading measure of manufacturing health?",
          options: [
            "ISM PMI",
            "CPI",
            "Nonfarm payrolls",
            "Trade balance"
          ],
          correctAnswer: 0,
          explanation: "The ISM Manufacturing PMI surveys purchasing managers and is considered a leading indicator of manufacturing activity."
        },
        {
          question: "What does a steepening yield curve typically signal?",
          options: [
            "Expectations for stronger growth and inflation",
            "Imminent recession",
            "Lower long-term rates than short-term rates",
            "No change in economic outlook"
          ],
          correctAnswer: 0,
          explanation: "A steepening curve (long-term yields rising faster than short-term) often reflects expectations for stronger growth and inflation."
        }
      ]
    }
  ];

  const { user } = useAuth();
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [progressHydrated, setProgressHydrated] = useState(false);

  const progressKey = (user?.id ?? 'guest') + ':quiz_progress';

  // Restore saved progress for the current user.
  useEffect(() => {
    const saved = localStorage.getItem(progressKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedQuiz(parsed.selectedQuiz ?? null);
        setCurrentQuestion(parsed.currentQuestion ?? 0);
        setSelectedAnswer(parsed.selectedAnswer ?? null);
        setShowExplanation(parsed.showExplanation ?? false);
        setScore(parsed.score ?? 0);
        setCompleted(parsed.completed ?? false);
      } catch {
        setSelectedQuiz(null);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setCompleted(false);
      }
    } else {
      setSelectedQuiz(null);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
      setCompleted(false);
    }
    setProgressHydrated(true);
  }, [progressKey]);

  // Save progress whenever it changes.
  useEffect(() => {
    if (!progressHydrated) return;
    const payload = {
      selectedQuiz,
      currentQuestion,
      selectedAnswer,
      showExplanation,
      score,
      completed,
    };
    localStorage.setItem(progressKey, JSON.stringify(payload));
  }, [selectedQuiz, currentQuestion, selectedAnswer, showExplanation, score, completed, progressHydrated, progressKey]);

  const handleQuizStart = (index: number) => {
    setSelectedQuiz(index);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const quiz = quizzes[selectedQuiz!];
    if (answerIndex === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    const quiz = quizzes[selectedQuiz!];
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setSelectedQuiz(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (selectedQuiz === null) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Test Your Knowledge
            <span className="block bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Interactive Quizzes
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Challenge yourself with our interactive quizzes and track your progress
          </p>
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full text-sm font-semibold border border-white/10 text-slate-200">
              {user ? 'Signed in — progress will sync on this device' : 'Sign in to save your quiz progress'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-orange-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {quiz.title}
                </h3>
                <span className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>

              <p className="text-gray-400 mb-6">
                {quiz.questions.length} questions • Test your understanding
              </p>

              <button
                onClick={() => handleQuizStart(index)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold rounded-xl transition-all"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const quiz = quizzes[selectedQuiz];
  const question = quiz.questions[currentQuestion];

  if (completed) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="mb-6">
            <Award className={`w-20 h-20 mx-auto mb-4 ${isPassing ? 'text-green-400' : 'text-yellow-400'}`} />
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
            <p className="text-gray-400">Here's how you did</p>
          </div>

          <div className="bg-white/5 rounded-xl p-8 mb-6">
            <div className="text-6xl font-black text-white mb-2">
              {percentage}%
            </div>
            <p className="text-xl text-gray-400">
              {score} out of {quiz.questions.length} correct
            </p>
          </div>

          <div className="space-y-4">
            {isPassing ? (
              <p className="text-green-400 font-semibold">
                Great job! You've mastered this topic.
              </p>
            ) : (
              <p className="text-yellow-400 font-semibold">
                Good effort! Review the material and try again to improve your score.
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => handleQuizStart(selectedQuiz)}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
            <button
              onClick={handleRestart}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Exit Quiz
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-orange-400 font-semibold">
              Score: {score}/{quiz.questions.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl text-white font-semibold mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showResult = showExplanation;

              let buttonClass = "w-full text-left p-4 rounded-xl border transition-all ";

              if (!showResult) {
                buttonClass += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-orange-500/50 text-white";
              } else if (isCorrect) {
                buttonClass += "bg-green-500/20 border-green-500 text-green-400";
              } else if (isSelected && !isCorrect) {
                buttonClass += "bg-red-500/20 border-red-500 text-red-400";
              } else {
                buttonClass += "bg-white/5 border-white/10 text-gray-400";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && isCorrect && <CheckCircle className="w-5 h-5" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showExplanation && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <p className="text-orange-400 font-semibold mb-2">Explanation:</p>
            <p className="text-gray-300 text-sm">{question.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all"
          >
            {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
