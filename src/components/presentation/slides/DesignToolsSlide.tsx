import { Box, Calculator, FileText, Download, Palette, Ruler } from 'lucide-react';

export function DesignToolsSlide() {
  const tools = [
    {
      icon: Box,
      title: "3D Design Studio",
      description: "Drag-and-drop lighting design with real-time rendering",
      features: ["Interactive 3D environment", "Fixture library integration", "Photometric calculations"]
    },
    {
      icon: Calculator,
      title: "25+ Calculators",
      description: "Professional tools for every aspect of lighting design",
      features: ["PPFD mapping", "Energy calculations", "ROI analysis"]
    },
    {
      icon: FileText,
      title: "Professional Reports",
      description: "Automatically generated documentation and proposals",
      features: ["Custom branding", "Technical specifications", "Cost breakdowns"]
    }
  ];

  return (
    <div className="h-full flex flex-col justify-center p-12 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            3D Design Studio
          </h1>
          <p className="text-2xl text-blue-200 max-w-4xl mx-auto">
            Professional lighting design made simple with AI-powered tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{tool.title}</h3>
                <p className="text-blue-200 text-sm">{tool.description}</p>
              </div>
              
              <ul className="space-y-2">
                {tool.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-8 border border-purple-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Design Workflow</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <span className="text-gray-300">Import room dimensions or use templates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <span className="text-gray-300">Drag fixtures from DLC database</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <span className="text-gray-300">AI optimizes placement and settings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <span className="text-gray-300">Generate professional reports</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-6">Design Time Saved</h3>
              <div className="text-6xl font-bold text-green-400 mb-4">85%</div>
              <p className="text-gray-300 mb-6">From weeks to hours</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xl font-bold text-red-400">Before: 40+ hrs</div>
                  <div className="text-gray-400">Manual calculations</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-400">Now: 6 hrs</div>
                  <div className="text-gray-400">Automated design</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}