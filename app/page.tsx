'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TrackViewport from '@/components/TrackViewport';
import TelemetryPanels from '@/components/TelemetryPanels';
import TyreMonitoring from '@/components/TyreMonitoring';
import AIAnalysisEngine from '@/components/AIAnalysisEngine';
import PerformanceCharts from '@/components/PerformanceCharts';
import PitStopWarning from '@/components/PitStopWarning';
import { useLiveTelemetry } from '@/lib/useLiveTelemetry';
import { useTelemetryStore } from '@/lib/telemetryStore';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [raceActive, setRaceActive] = useState(false);
  const { telemetry, updateTelemetry } = useTelemetryStore();
  
  // Initialize simulator / live telemetry
  useLiveTelemetry();

  useEffect(() => {
    setMounted(true);
  }, []);

  // START RACE simulation loop
  useEffect(() => {
    if (!raceActive) return;

    const raceInterval = setInterval(() => {
      // Aggressive tyre wear decay
      updateTelemetry({
        isConnected: true,
        sessionMode: 'RACE',
        tyreWear: {
          frontLeft: Math.max(0, telemetry.tyreWear.frontLeft - 0.8),
          frontRight: Math.max(0, telemetry.tyreWear.frontRight - 0.8),
          rearLeft: Math.max(0, telemetry.tyreWear.rearLeft - 1.0),
          rearRight: Math.max(0, telemetry.tyreWear.rearRight - 1.0),
        },
        // Fuel consumption
        fuelRemaining: Math.max(0, telemetry.fuelRemaining - 0.3),
        // ERS drain
        ersBattery: Math.max(0, telemetry.ersBattery - 0.5),
        // Increase tyre temps
        tyreTemp: {
          frontLeft: Math.min(120, telemetry.tyreTemp.frontLeft + 0.5),
          frontRight: Math.min(120, telemetry.tyreTemp.frontRight + 0.5),
          rearLeft: Math.min(120, telemetry.tyreTemp.rearLeft + 0.6),
          rearRight: Math.min(120, telemetry.tyreTemp.rearRight + 0.6),
        },
      });
    }, 1000); // Update every second

    return () => clearInterval(raceInterval);
  }, [raceActive, telemetry, updateTelemetry]);

  const handleStartRace = () => {
    setRaceActive(true);
    // Immediately set to full throttle
    updateTelemetry({
      isConnected: true,
      sessionMode: 'RACE',
      speed: 330,
      throttle: 100,
      rpm: 14500,
      gear: 8,
      drsStatus: true,
      ersDeployment: 100,
    });
  };

  const handleStopRace = () => {
    setRaceActive(false);
    updateTelemetry({
      speed: 0,
      throttle: 0,
      rpm: 0,
      gear: 1,
      drsStatus: false,
      ersDeployment: 0,
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gradient mb-4">F1 RACE COMMAND CENTER</div>
          <div className="text-sm text-carbon-400 font-mono">Initializing systems...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-carbon-950 grid-background overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel border-b border-carbon-800 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-gradient">F1 RACE COMMAND CENTER</div>
            <div className="glass-panel px-3 py-1">
              <span className="text-xs text-carbon-400 font-mono">POWERED BY </span>
              <span className="text-sm font-bold text-telemetry-cyan">IBM WATSONX AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 glass-panel px-3 py-1">
              <div className={`w-2 h-2 rounded-full ${telemetry.isConnected ? 'bg-telemetry-green animate-pulse' : 'bg-telemetry-red'}`} />
              <span className="text-xs text-carbon-400 font-mono">
                {telemetry.isConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>

            {/* Session info */}
            <div className="glass-panel px-3 py-1">
              <span className="text-xs text-carbon-400 font-mono">SESSION: </span>
              <span className="text-sm font-bold text-white">{telemetry.sessionMode}</span>
            </div>

            {/* Weather */}
            <div className="glass-panel px-3 py-1">
              <span className="text-xs text-carbon-400 font-mono">WEATHER: </span>
              <span className="text-sm font-bold text-white">{telemetry.weatherCondition}</span>
            </div>

            {/* Track temp */}
            <div className="glass-panel px-3 py-1">
              <span className="text-xs text-carbon-400 font-mono">TRACK: </span>
              <span className="text-sm font-bold text-telemetry-orange">{telemetry.trackTemp}°C</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard */}
      <div className="p-6 space-y-6 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
        {/* Track Viewport - Top Center */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TrackViewport />
        </motion.section>

        {/* START RACE Control Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center"
        >
          {!raceActive ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRace}
              className="px-12 py-6 bg-gradient-to-r from-telemetry-red to-telemetry-orange text-white font-bold text-2xl rounded-xl shadow-2xl hover:shadow-telemetry-red/50 transition-all duration-300 font-mono tracking-wider border-2 border-telemetry-red/50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-telemetry-red/0 via-white/20 to-telemetry-red/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center gap-3">
                <span className="text-3xl">🏁</span>
                START RACE (FULL THROTTLE)
                <span className="text-3xl">🏁</span>
              </span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStopRace}
              className="px-12 py-6 bg-gradient-to-r from-carbon-800 to-carbon-700 text-white font-bold text-2xl rounded-xl shadow-2xl hover:shadow-carbon-600/50 transition-all duration-300 font-mono tracking-wider border-2 border-carbon-600/50"
            >
              <span className="flex items-center gap-3">
                <span className="text-3xl">⏹️</span>
                STOP RACE
                <span className="text-3xl">⏹️</span>
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Telemetry Panels */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TelemetryPanels />
        </motion.section>

        {/* Main Grid - Tyre Monitoring, AI Analysis, Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tyre Monitoring */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <TyreMonitoring />
          </motion.section>

          {/* AI Analysis Engine */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <AIAnalysisEngine />
          </motion.section>

          {/* Performance Charts */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-1"
          >
            <PerformanceCharts />
          </motion.section>
        </div>

        {/* Footer Info */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-panel p-4 text-center"
        >
          <div className="flex items-center justify-center gap-6 text-xs text-carbon-400 font-mono">
            <div>
              <span className="text-telemetry-cyan">TELEMETRY ENGINE:</span> ACTIVE
            </div>
            <div>
              <span className="text-telemetry-green">AI ANALYSIS:</span> AI v2.0
            </div>
            <div>
              <span className="text-telemetry-purple">SIMULATION:</span> REAL-TIME
            </div>
            <div>
              <span className="text-telemetry-amber">UPDATE RATE:</span> 10Hz
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Pitstop Warning Overlay */}
      <PitStopWarning />

      {/* Ambient scan line effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="scan-line" />
      </div>
    </main>
  );
}

// Made with Bob
