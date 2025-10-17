'use client';

import { motion } from 'framer-motion';
import { Award, Star, Trophy, Medal, Target, Zap, Leaf, Globe } from 'lucide-react';
import { useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  year?: string;
  category: 'award' | 'milestone' | 'certification' | 'innovation';
}

const achievements: Achievement[] = [
  {
    id: '40under40',
    title: '40 Under 40',
    description: 'Greenhouse Product News recognition for young leaders in horticulture',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-yellow-400 to-orange-500',
    year: '2017',
    category: 'award',
  },
  {
    id: 'space-ag',
    title: 'Space Agriculture Pioneer',
    description: 'Co-authored groundbreaking LED research with University of Arizona',
    icon: <Star className="w-6 h-6" />,
    color: 'from-purple-400 to-pink-500',
    year: '2015',
    category: 'innovation',
  },
  {
    id: 'gceac',
    title: 'GCEAC Committee Member',
    description: 'Global CEA Consortium Sustainability Committee leadership',
    icon: <Globe className="w-6 h-6" />,
    color: 'from-green-400 to-blue-500',
    category: 'milestone',
  },
  {
    id: 'certified-hort',
    title: 'Certified Horticulturist',
    description: 'American Society for Horticultural Science certification',
    icon: <Award className="w-6 h-6" />,
    color: 'from-blue-400 to-purple-500',
    category: 'certification',
  },
  {
    id: 'led-pro',
    title: 'LED Professional',
    description: 'Advanced certifications in LED technology from Philips',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-cyan-400 to-blue-500',
    category: 'certification',
  },
  {
    id: 'sustainability',
    title: 'Sustainability Leader',
    description: 'Advancing sustainable agriculture through innovative lighting solutions',
    icon: <Leaf className="w-6 h-6" />,
    color: 'from-green-400 to-emerald-500',
    category: 'milestone',
  },
];

const categoryFilters = [
  { id: 'all', label: 'All Achievements' },
  { id: 'award', label: 'Awards' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'certification', label: 'Certifications' },
  { id: 'milestone', label: 'Milestones' },
];

export function AchievementsBadges() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

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
            Achievements & Recognition
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Celebrating milestones in agricultural innovation
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categoryFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedCategory(filter.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === filter.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Achievement Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredAchievement(achievement.id)}
              onHoverEnd={() => setHoveredAchievement(null)}
              className="relative group"
            >
              {/* Glow Effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${achievement.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-2xl`}
              />
              
              {/* Badge Content */}
              <div className="relative bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10 group-hover:border-white/20 transition-all h-full">
                {/* Icon Badge */}
                <div className="mb-6 relative">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${achievement.color} relative`}>
                    <div className="text-white">
                      {achievement.icon}
                    </div>
                    {hoveredAchievement === achievement.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur"
                      />
                    )}
                  </div>
                  {achievement.year && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {achievement.year}
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-2">{achievement.title}</h3>
                <p className="text-gray-400">{achievement.description}</p>

                {/* Category Tag */}
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                    {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-3xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Achievement Impact</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-purple-400">15+</div>
              <p className="text-gray-400">Industry Awards</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">8</div>
              <p className="text-gray-400">Certifications</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">25+</div>
              <p className="text-gray-400">Speaking Events</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">5</div>
              <p className="text-gray-400">Research Papers</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}