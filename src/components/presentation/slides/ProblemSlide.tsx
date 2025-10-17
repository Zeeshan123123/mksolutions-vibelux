import { AlertTriangle, TrendingUp, DollarSign, Users, Settings, BarChart3 } from 'lucide-react';

export function ProblemSlide() {
  const problems = [
    {
      icon: DollarSign,
      title: "Rising Energy Costs",
      description: "Lighting represents 25-40% of operational costs",
      stat: "40%",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Settings,
      title: "Complex Design Process",
      description: "Manual calculations and disconnected tools",
      stat: "100+ hrs",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: BarChart3,
      title: "Limited Analytics",
      description: "Lack of data-driven optimization insights",
      stat: "80%",
      color: "from-yellow-500 to-green-500"
    },
    {
      icon: Users,
      title: "Skills Gap",
      description: "Shortage of lighting design expertise",
      stat: "65%",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Scaling Challenges",
      description: "Difficulty managing multiple facilities",
      stat: "3x",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: AlertTriangle,
      title: "Compliance Complexity",
      description: "Evolving regulations and standards",
      stat: "50+",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="h-full flex flex-col justify-center p-12 bg-gradient-to-br from-red-900/90 via-gray-900 to-orange-900/90">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            The Challenge
          </h1>
          <p className="text-2xl text-red-200 max-w-4xl mx-auto">
            Controlled Environment Agriculture is becoming increasingly complex,
            yet growers are still using outdated tools and manual processes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 hover:border-red-400/40 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${problem.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <problem.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{problem.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{problem.description}</p>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${problem.color} bg-clip-text text-transparent`}>
                    {problem.stat}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">The Result?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-red-400 mb-2">$50B+</div>
                <div className="text-gray-300">Wasted energy annually</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-400 mb-2">60%</div>
                <div className="text-gray-300">Below optimal yields</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">18 months</div>
                <div className="text-gray-300">Average time to profitability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}