import { CheckCircle, ArrowRight, Sparkles, BarChart3, Settings, Database } from 'lucide-react';

export function SolutionOverviewSlide() {
  const solutions = [
    {
      icon: Sparkles,
      title: "3D Design Studio",
      description: "Professional lighting design with AI assistance",
      benefits: ["Drag & drop interface", "Real-time calculations", "Professional reports"]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Data-driven insights for optimization",
      benefits: ["Yield predictions", "Energy monitoring", "Performance trends"]
    },
    {
      icon: Settings,
      title: "Automation Hub",
      description: "Complete facility control and management",
      benefits: ["Automated schedules", "Remote monitoring", "Alert systems"]
    },
    {
      icon: Database,
      title: "DLC Database",
      description: "2,400+ certified fixtures at your fingertips",
      benefits: ["Live pricing", "Spec comparisons", "Compatibility check"]
    }
  ];

  return (
    <div className="h-full flex flex-col justify-center p-12 bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            VibeLux: Your Complete CEA Technology Partner
          </h1>
          <p className="text-2xl text-green-200 max-w-4xl mx-auto">
            The first integrated platform that brings together design, analytics, automation, 
            and optimization in one comprehensive solution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <solution.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-3">{solution.title}</h3>
                  <p className="text-green-200 mb-4">{solution.description}</p>
                  
                  <ul className="space-y-2">
                    {solution.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">The VibeLux Difference</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">All-in-One</div>
                <div className="text-gray-300">No more switching between tools</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-teal-400 mb-2">AI-Powered</div>
                <div className="text-gray-300">Intelligent optimization algorithms</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 mb-2">Cloud-Based</div>
                <div className="text-gray-300">Access anywhere, anytime</div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-teal-600 px-8 py-4 rounded-full">
                <span className="text-white font-semibold text-lg">Ready to see it in action?</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}