'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetryStore } from '@/lib/telemetryStore';
import { useEffect, useRef } from 'react';

export default function PitStopWarning() {
  const { telemetry, clearWarning } = useTelemetryStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (telemetry.showPitStopWarning && telemetry.warningLevel === 'critical') {
      // Play warning sound (simplified beep)
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  }, [telemetry.showPitStopWarning, telemetry.warningLevel]);

  return (
    <>
      {/* Warning audio - simple beep tone */}
      <audio ref={audioRef} loop>
        <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" type="audio/wav" />
      </audio>

      <AnimatePresence>
        {telemetry.showPitStopWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={clearWarning}
          >
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`relative max-w-2xl w-full mx-4 p-8 rounded-2xl border-4 ${
                telemetry.warningLevel === 'critical'
                  ? 'border-telemetry-red bg-telemetry-red/20 critical-alert'
                  : 'border-telemetry-amber bg-telemetry-amber/20 warning-pulse'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated border glow */}
              <div className={`absolute inset-0 rounded-2xl ${
                telemetry.warningLevel === 'critical' ? 'glow-red' : ''
              }`} />

              {/* Warning icon */}
              <motion.div
                animate={{
                  rotate: [0, -5, 5, -5, 5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="text-center mb-6"
              >
                <div className={`text-8xl ${
                  telemetry.warningLevel === 'critical' ? 'text-telemetry-red' : 'text-telemetry-amber'
                }`}>
                  ⚠️
                </div>
              </motion.div>

              {/* Warning title */}
              <h2 className={`text-4xl font-bold text-center mb-4 font-mono ${
                telemetry.warningLevel === 'critical' ? 'text-telemetry-red' : 'text-telemetry-amber'
              }`}>
                {telemetry.warningLevel === 'critical' ? 'CRITICAL ALERT' : 'WARNING'}
              </h2>

              {/* Main message */}
              <div className="glass-panel p-6 mb-6 border border-white/20">
                <p className="text-3xl font-bold text-center text-white mb-4">
                  PLEASE TAKE PITSTOP
                </p>
                <p className="text-lg text-center text-carbon-200 font-mono">
                  {telemetry.warningMessage}
                </p>
              </div>

              {/* Telemetry snapshot */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-panel p-3 text-center">
                  <div className="text-xs text-carbon-400 font-mono mb-1">TYRE WEAR</div>
                  <div className={`text-2xl font-bold font-mono ${
                    telemetry.aiPredictions.tyreHealth < 40 ? 'text-telemetry-red' : 'text-telemetry-amber'
                  }`}>
                    {Math.round(telemetry.aiPredictions.tyreHealth)}%
                  </div>
                </div>
                <div className="glass-panel p-3 text-center">
                  <div className="text-xs text-carbon-400 font-mono mb-1">OVERHEAT RISK</div>
                  <div className={`text-2xl font-bold font-mono ${
                    telemetry.aiPredictions.overheatingRisk > 70 ? 'text-telemetry-red' : 'text-telemetry-amber'
                  }`}>
                    {Math.round(telemetry.aiPredictions.overheatingRisk)}%
                  </div>
                </div>
                <div className="glass-panel p-3 text-center">
                  <div className="text-xs text-carbon-400 font-mono mb-1">CONFIDENCE</div>
                  <div className="text-2xl font-bold font-mono text-telemetry-cyan">
                    {Math.round(telemetry.aiPredictions.pitStopConfidence)}%
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearWarning}
                  className="flex-1 px-6 py-4 bg-telemetry-red text-white font-bold rounded-lg hover:bg-telemetry-red/90 transition-all shadow-lg hover:shadow-telemetry-red/50 font-mono text-lg"
                >
                  ACKNOWLEDGE
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearWarning}
                  className="flex-1 px-6 py-4 glass-panel text-white font-bold rounded-lg hover:bg-carbon-800/60 transition-all font-mono text-lg"
                >
                  DISMISS
                </motion.button>
              </div>

              {/* Pulsing indicators */}
              <div className="absolute top-4 right-4 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className={`w-3 h-3 rounded-full ${
                      telemetry.warningLevel === 'critical' ? 'bg-telemetry-red' : 'bg-telemetry-amber'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Made with Bob
