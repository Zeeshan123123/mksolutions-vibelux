'use client';

import { motion } from 'framer-motion';
import { Play, Youtube } from 'lucide-react';
import { useState } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
}

const featuredVideos: Video[] = [
  {
    id: 'dQw4w9WgXcQ', // Replace with actual video ID
    title: 'Introduction to VibeLux Platform',
    thumbnail: '/video-thumbnails/intro.jpg',
  },
  {
    id: 'dQw4w9WgXcQ', // Replace with actual video ID
    title: 'Advanced Lighting Design Tutorial',
    thumbnail: '/video-thumbnails/tutorial.jpg',
  },
  {
    id: 'dQw4w9WgXcQ', // Replace with actual video ID
    title: 'Customer Success Stories',
    thumbnail: '/video-thumbnails/success.jpg',
  },
];

export function VideoSection() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

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
            Learn from the Expert
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-6"
          >
            Watch Blake share insights on horticultural lighting and controlled environment agriculture
          </motion.p>
          <motion.a
            href="https://www.youtube.com/@hortlightguy"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Youtube className="w-5 h-5" />
            Subscribe to @hortlightguy
          </motion.a>
        </div>

        {/* Featured Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900">
            {selectedVideo ? (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={() => setSelectedVideo('dQw4w9WgXcQ')} // Replace with main video ID
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="relative z-10 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-full mb-4 group-hover:bg-purple-500 transition-colors"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </motion.div>
                  <p className="text-white text-xl font-semibold">Watch: The Future of Horticultural Lighting</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedVideo(video.id)}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 mb-3">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
              <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                {video.title}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* YouTube Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">1K+</p>
            <p className="text-gray-400">Subscribers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">50+</p>
            <p className="text-gray-400">Videos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">100K+</p>
            <p className="text-gray-400">Views</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}