import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AchievementPopupProps {
  onClose: () => void;
}

const achievementImages = [
  {
    url: 'https://images.unsplash.com/photo-1775623606576-3e049f72b8e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: '100% Placement Success',
    description: 'Class of 2025 achieves record placement rates'
  },
  {
    url: 'https://images.unsplash.com/photo-1759328381007-64559a862aa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Academic Excellence',
    description: 'Outstanding performance in university examinations'
  },
  {
    url: 'https://images.unsplash.com/photo-1773828948581-5b50c6ee17a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Award Ceremony 2026',
    description: 'Recognition of student achievements and innovations'
  },
  {
    url: 'https://images.unsplash.com/photo-1773921405279-aa673da773b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Top Rankers',
    description: 'Our students securing top positions in state exams'
  },
  {
    url: 'https://images.unsplash.com/photo-1767595789539-cd012af80914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Research Excellence',
    description: 'Published research in international journals'
  }
];

export function AchievementPopup({ onClose }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % achievementImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-4xl mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img
                src={achievementImages[currentIndex].url}
                alt={achievementImages[currentIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl mb-2"
                >
                  {achievementImages[currentIndex].title}
                </motion.h3>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-200"
                >
                  {achievementImages[currentIndex].description}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 p-4 bg-white">
          {achievementImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-900 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
