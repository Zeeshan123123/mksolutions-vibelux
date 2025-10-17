'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Award, Globe, Users, TrendingUp } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

const timelineEvents: TimelineEvent[] = [
  {
    year: '2006',
    title: 'University Leadership',
    description: 'BS Entrepreneurship from University of Illinois Chicago, Vice President of Collegiate Entrepreneurs Organization',
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    year: '2012',
    title: 'Industry Entry',
    description: 'Began career in agricultural technology and LED lighting, building on family farming background',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    year: '2018',
    title: 'Philips Lighting Career',
    description: 'Joined Philips Lighting (now Signify) as horticultural lighting specialist, earning multiple LED certifications',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    year: '2021',
    title: 'Industry Leadership',
    description: 'Joined Resource Innovation Institute CEA Leadership Committee and USDA Specialty Crop Research Initiative',
    icon: <Users className="w-5 h-5" />,
  },
  {
    year: '2021',
    title: 'Holland on the Hill Speaker',
    description: 'Invited speaker on "Collaborative Innovation in Sustainable Agriculture" for US-Dutch relations program',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    year: '2022',
    title: 'Industry Recognition',
    description: 'Named to Greenhouse Product News 40 Under 40 Class of 2022 and Global CEA Consortium leadership',
    icon: <Award className="w-5 h-5" />,
    highlight: true,
  },
  {
    year: '2024',
    title: 'VibeLux Platform Launch',
    description: 'Founded VibeLux to democratize professional horticultural lighting design tools for all growers',
    icon: <Award className="w-5 h-5" />,
    highlight: true,
  },
];

export function Timeline() {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            Our Journey
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Building the future of agriculture, one milestone at a time
          </motion.p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-purple-600 via-purple-400 to-transparent" />

          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                  <div className={`bg-white/5 backdrop-blur p-6 rounded-2xl border ${
                    event.highlight ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-white/10'
                  }`}>
                    <div className={`flex items-center gap-3 mb-3 ${
                      index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                    }`}>
                      <div className={`p-2 rounded-lg ${
                        event.highlight ? 'bg-purple-600/20 text-purple-400' : 'bg-white/10 text-gray-400'
                      }`}>
                        {event.icon}
                      </div>
                      <span className="text-2xl font-bold text-white">{event.year}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-400">{event.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4">
                  <div className={`w-full h-full rounded-full ${
                    event.highlight ? 'bg-purple-500 ring-4 ring-purple-500/20' : 'bg-white/20'
                  } animate-pulse`} />
                </div>

                {/* Spacer */}
                <div className="hidden md:block w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}