import { CheckCircle, ArrowRight } from 'lucide-react';

export function AgendaSlide() {
  const agendaItems = [
    {
      title: "The Challenge",
      description: "Growing complexity in controlled environment agriculture",
      time: "5 min"
    },
    {
      title: "VibeLux Solution",
      description: "Complete platform overview and key differentiators",
      time: "10 min"
    },
    {
      title: "Core Features Deep Dive",
      description: "3D Design • Analytics • Automation • DLC Database",
      time: "20 min"
    },
    {
      title: "Business Value & ROI",
      description: "Real customer results and competitive advantages",
      time: "10 min"
    },
    {
      title: "Live Demo",
      description: "See VibeLux in action with real-world scenarios",
      time: "10 min"
    },
    {
      title: "Next Steps",
      description: "Pricing, implementation, and partnership opportunities",
      time: "5 min"
    }
  ];

  return (
    <div className="h-full flex flex-col justify-center p-12 bg-gradient-to-br from-slate-900 to-gray-900">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-6xl font-bold text-white mb-4 text-center">
          What We'll Cover Today
        </h1>
        
        <p className="text-xl text-gray-300 text-center mb-16">
          60 minutes to transform how you think about horticultural lighting
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {agendaItems.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <span className="text-sm text-purple-300 bg-purple-900/50 px-3 py-1 rounded-full">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-full">
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Interactive presentation - ask questions anytime!</span>
          </div>
        </div>
      </div>
    </div>
  );
}