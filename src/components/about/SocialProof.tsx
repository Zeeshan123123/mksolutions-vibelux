'use client';

import { motion } from 'framer-motion';
import { Users, Building, Globe, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Metric {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

const metrics: Metric[] = [
  {
    label: 'Years in Horticulture',
    value: 10,
    suffix: '+',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600',
  },
  {
    label: 'Research Publications',
    value: 5,
    suffix: '+',
    icon: <Building className="w-6 h-6" />,
    color: 'from-green-400 to-green-600',
  },
  {
    label: 'Conference Presentations',
    value: 25,
    suffix: '+',
    icon: <Globe className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-600',
  },
  {
    label: 'Industry Recognition',
    value: 1,
    suffix: '',
    icon: <Award className="w-6 h-6" />,
    color: 'from-yellow-400 to-yellow-600',
  },
];

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration]);

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function SocialProof() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            Our Impact in Numbers
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Trusted by growers worldwide to optimize their operations
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          onViewportEnter={() => setIsVisible(true)}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                   style={{
                     backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                   }}>
                <div className={`w-full h-full bg-gradient-to-r ${metric.color}`} />
              </div>
              
              <div className="relative bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10 group-hover:border-white/20 transition-all">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${metric.color} bg-opacity-10 mb-4`}>
                  <div className={`bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                    {metric.icon}
                  </div>
                </div>
                
                <div className="text-4xl font-bold text-white mb-2">
                  {isVisible && (
                    <AnimatedCounter end={metric.value} suffix={metric.suffix} />
                  )}
                </div>
                
                <p className="text-gray-400 font-medium">{metric.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-3xl p-8 md:p-12 border border-white/10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-300 italic mb-6">
              "VibeLux has revolutionized how we approach lighting design. The platform's accuracy and ease of use 
              have saved us countless hours and significantly improved our yields. It's an essential tool for any 
              serious grower."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" />
              <div className="text-left">
                <p className="text-white font-semibold">Sarah Chen</p>
                <p className="text-gray-400 text-sm">Head of Operations, GreenTech Farms</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}