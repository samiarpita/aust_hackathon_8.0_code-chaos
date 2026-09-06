import React from 'react';
import { motion } from 'framer-motion';

export default function MeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary Cosmic Violet Glow - Top Center/Right */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          x: [0, 20, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[15%] right-[5%] w-[650px] h-[650px] rounded-full 
                   bg-gradient-to-br from-[#7847EB]/20 via-[#B388FF]/15 to-transparent 
                   dark:from-[#7847EB]/25 dark:via-[#9061F9]/20 dark:to-transparent 
                   blur-[120px]"
      />

      {/* Soft Rose-Lavender Ambient Glow - Center Left */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-[35%] -left-[10%] w-[580px] h-[580px] rounded-full 
                   bg-gradient-to-tr from-[#F472B6]/15 via-[#C084FC]/15 to-transparent 
                   dark:from-[#F472B6]/15 dark:via-[#A855F7]/20 dark:to-transparent 
                   blur-[130px]"
      />

      {/* Deep Lilac/Deep Violet Glow - Bottom Center */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 25, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute -bottom-[20%] left-[25%] w-[700px] h-[700px] rounded-full 
                   bg-gradient-to-t from-[#6366F1]/15 via-[#8B5CF6]/15 to-transparent 
                   dark:from-[#4C1D95]/30 dark:via-[#6D28D9]/20 dark:to-transparent 
                   blur-[140px]"
      />

      {/* Subtle Grid Lines Overlay for academic precision */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, #7847EB 1px, transparent 1px),
                            linear-gradient(to bottom, #7847EB 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
}
