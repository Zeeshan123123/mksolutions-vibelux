import { Sparkles, Leaf, Zap } from 'lucide-react';

export function TitleSlide() {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-teal-500 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-20 h-20 bg-blue-500 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-6xl font-bold">
            <span className="text-purple-400">Vibe</span>
            <span className="text-teal-400">Lux</span>
          </div>
        </div>

        {/* Tagline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Professional Horticultural
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            Lighting Platform
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-blue-200 mb-12 max-w-4xl">
          Complete software solution for controlled environment agriculture:
          <br />
          Design • Analyze • Optimize • Automate
        </p>

        {/* Feature Icons */}
        <div className="flex justify-center gap-12 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Sparkles className="w-8 h-8 text-purple-300" />
            </div>
            <p className="text-purple-200 text-sm">AI-Powered Design</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-600/30 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Leaf className="w-8 h-8 text-teal-300" />
            </div>
            <p className="text-teal-200 text-sm">Optimized Growing</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/30 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Zap className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-blue-200 text-sm">Energy Savings</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-16 text-center">
          <div>
            <div className="text-3xl font-bold text-white">2,400+</div>
            <div className="text-sm text-gray-300">DLC Fixtures</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">30%</div>
            <div className="text-sm text-gray-300">Energy Savings</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">25+</div>
            <div className="text-sm text-gray-300">Calculators</div>
          </div>
        </div>
      </div>
    </div>
  );
}