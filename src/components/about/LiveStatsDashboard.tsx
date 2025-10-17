'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, Globe, Zap, Leaf, Calculator,
  ArrowUp, ArrowDown, Activity, BarChart3, Clock, Building
} from 'lucide-react';

interface Stat {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  format?: (value: number) => string;
}

export function LiveStatsDashboard() {
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState<Stat[]>([
    {
      id: 'platform-features',
      label: 'Platform Features',
      value: 25,
      change: 12,
      changeType: 'positive',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-400',
    },
    {
      id: 'calculations',
      label: 'Calculation Types',
      value: 15,
      change: 23,
      changeType: 'positive',
      icon: <Calculator className="w-5 h-5" />,
      color: 'text-purple-400',
    },
    {
      id: 'beta-facilities',
      label: 'Beta Testing Facilities',
      value: 8,
      change: 8,
      changeType: 'positive',
      icon: <Building className="w-5 h-5" />,
      color: 'text-yellow-400',
    },
    {
      id: 'research-projects',
      label: 'Research Collaborations',
      value: 3,
      change: 15,
      changeType: 'positive',
      icon: <Leaf className="w-5 h-5" />,
      color: 'text-green-400',
    },
    {
      id: 'integrations',
      label: 'System Integrations',
      value: 12,
      change: 3,
      changeType: 'positive',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-indigo-400',
    },
    {
      id: 'development-years',
      label: 'Years in Development',
      value: 3,
      icon: <Globe className="w-5 h-5" />,
      color: 'text-cyan-400',
    },
  ]);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => {
          // Simulate realistic changes
          let newValue = stat.value;
          const changeAmount = Math.random() * 10;
          
          switch (stat.id) {
            case 'active-users':
              // Users fluctuate up and down
              newValue += Math.random() > 0.5 ? Math.floor(changeAmount) : -Math.floor(changeAmount);
              newValue = Math.max(300, Math.min(400, newValue));
              break;
            case 'calculations':
              // Calculations only go up
              newValue += Math.floor(changeAmount * 5);
              break;
            case 'energy-saved':
              // Energy saved increases steadily
              newValue += Math.floor(changeAmount * 100);
              break;
            case 'co2-reduced':
              // CO2 reduced increases slowly
              if (Math.random() > 0.7) newValue += 1;
              break;
            case 'facilities':
              // Facilities increase occasionally
              if (Math.random() > 0.95) newValue += 1;
              break;
          }

          return { ...stat, value: newValue };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getChangeIcon = (changeType?: string) => {
    if (changeType === 'positive') return <ArrowUp className="w-4 h-4" />;
    if (changeType === 'negative') return <ArrowDown className="w-4 h-4" />;
    return null;
  };

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <Activity className={`w-6 h-6 ${isLive ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
            <h2 className="text-4xl font-bold text-white">Platform Statistics</h2>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isLive 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {isLive ? 'LIVE' : 'Start Live Updates'}
            </button>
          </motion.div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-time insights into VibeLux's global impact on sustainable agriculture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-gray-800 ${stat.color}`}>
                        {stat.icon}
                      </div>
                      {stat.change && (
                        <div className={`flex items-center gap-1 text-sm ${
                          stat.changeType === 'positive' ? 'text-green-400' : 
                          stat.changeType === 'negative' ? 'text-red-400' : 
                          'text-gray-400'
                        }`}>
                          {getChangeIcon(stat.changeType)}
                          <span>{stat.change}%</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={stat.value}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-3xl font-bold text-white"
                          >
                            {stat.format ? stat.format(stat.value) : stat.value.toLocaleString()}
                          </motion.p>
                        </AnimatePresence>
                        {stat.unit && (
                          <span className="text-gray-400 text-lg">{stat.unit}</span>
                        )}
                      </div>
                    </div>

                    {/* Live Indicator */}
                    {isLive && (
                      <div className="absolute top-3 right-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20 rounded-2xl p-8 border border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-2">Industry Experience</p>
              <p className="text-2xl font-bold text-green-400">10+ years</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Professional Certifications</p>
              <p className="text-2xl font-bold text-purple-400">25+</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Platform Development</p>
              <p className="text-2xl font-bold text-blue-400">3 years</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Beta Testing Phase</p>
              <p className="text-2xl font-bold text-yellow-400">Active</p>
            </div>
          </div>
        </motion.div>

        {/* Historical Chart Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 
                           rounded-lg text-gray-300 hover:text-white transition-all group">
            <BarChart3 className="w-5 h-5" />
            <span>View Historical Data</span>
            <ArrowUp className="w-4 h-4 transform rotate-45 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}