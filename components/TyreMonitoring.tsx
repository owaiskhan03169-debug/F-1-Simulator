'use client';

import { motion } from 'framer-motion';
import { useTelemetryStore } from '@/lib/telemetryStore';

export default function TyreMonitoring() {
  const { telemetry } = useTelemetryStore();

  const getTyreStatus = (wear: number, temp: number) => {
    if (wear < 30 || temp > 110) return 'critical';
    if (wear < 50 || temp > 100) return 'warning';
    return 'optimal';
  };

  const getTyreColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-telemetry-red';
      case 'warning':
        return 'text-telemetry-amber';
      default:
        return 'text-telemetry-green';
    }
  };

  const tyres = [
    {
      position: 'FL',
      name: 'Front Left',
      wear: telemetry.tyreWear.frontLeft,
      temp: telemetry.tyreTemp.frontLeft,
      x: 'left-[20%]',
      y: 'top-[25%]',
    },
    {
      position: 'FR',
      name: 'Front Right',
      wear: telemetry.tyreWear.frontRight,
      temp: telemetry.tyreTemp.frontRight,
      x: 'right-[20%]',
      y: 'top-[25%]',
    },
    {
      position: 'RL',
      name: 'Rear Left',
      wear: telemetry.tyreWear.rearLeft,
      temp: telemetry.tyreTemp.rearLeft,
      x: 'left-[20%]',
      y: 'bottom-[25%]',
    },
    {
      position: 'RR',
      name: 'Rear Right',
      wear: telemetry.tyreWear.rearRight,
      temp: telemetry.tyreTemp.rearRight,
      x: 'right-[20%]',
      y: 'bottom-[25%]',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gradient">TYRE MONITORING</h2>
        <div className="glass-panel px-3 py-1">
          <span className="text-xs text-carbon-400 font-mono">COMPOUND: </span>
          <span className="text-sm font-bold text-white">{telemetry.tyreCompound}</span>
        </div>
      </div>

      {/* Car visualization with tyres */}
      <div className="relative h-[300px] mb-6">
        {/* Car outline */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg width="120" height="200" viewBox="0 0 120 200" className="opacity-30">
            <rect x="30" y="20" width="60" height="160" fill="#2a2a2a" stroke="#00d4ff" strokeWidth="2" />
            <rect x="20" y="10" width="80" height="10" fill="#00d4ff" />
            <rect x="20" y="180" width="80" height="10" fill="#00d4ff" />
          </svg>
        </div>

        {/* Tyre indicators */}
        {tyres.map((tyre, index) => {
          const status = getTyreStatus(tyre.wear, tyre.temp);
          const colorClass = getTyreColor(status);

          return (
            <motion.div
              key={tyre.position}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`absolute ${tyre.x} ${tyre.y} transform -translate-x-1/2 -translate-y-1/2`}
            >
              <div className={`relative ${status === 'critical' ? 'critical-alert' : status === 'warning' ? 'warning-pulse' : ''}`}>
                {/* Tyre visual */}
                <div className={`w-20 h-24 glass-panel border-2 ${
                  status === 'critical' ? 'border-telemetry-red' :
                  status === 'warning' ? 'border-telemetry-amber' :
                  'border-telemetry-green'
                } rounded-lg flex flex-col items-center justify-center p-2`}>
                  <div className="text-xs text-carbon-400 font-mono mb-1">{tyre.position}</div>
                  
                  {/* Wear indicator */}
                  <div className="w-full mb-2">
                    <div className="flex justify-between text-[10px] text-carbon-400 mb-1">
                      <span>WEAR</span>
                      <span className={`font-bold ${colorClass}`}>{Math.round(tyre.wear)}%</span>
                    </div>
                    <div className="h-1.5 bg-carbon-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          status === 'critical' ? 'bg-telemetry-red' :
                          status === 'warning' ? 'bg-telemetry-amber' :
                          'bg-telemetry-green'
                        }`}
                        style={{ width: `${tyre.wear}%` }}
                      />
                    </div>
                  </div>

                  {/* Temperature indicator */}
                  <div className="w-full">
                    <div className="flex justify-between text-[10px] text-carbon-400 mb-1">
                      <span>TEMP</span>
                      <span className={`font-bold ${colorClass}`}>{Math.round(tyre.temp)}°C</span>
                    </div>
                    <div className="h-1.5 bg-carbon-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          tyre.temp > 110 ? 'bg-telemetry-red' :
                          tyre.temp > 100 ? 'bg-telemetry-amber' :
                          'bg-telemetry-green'
                        }`}
                        style={{ width: `${Math.min((tyre.temp / 120) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status glow */}
                {status === 'critical' && (
                  <div className="absolute inset-0 rounded-lg glow-red pointer-events-none" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel p-3">
          <div className="data-label text-[10px]">AVG WEAR</div>
          <div className={`text-xl font-bold font-mono ${getTyreColor(
            getTyreStatus(
              (telemetry.tyreWear.frontLeft + telemetry.tyreWear.frontRight + 
               telemetry.tyreWear.rearLeft + telemetry.tyreWear.rearRight) / 4,
              0
            )
          )}`}>
            {Math.round(
              (telemetry.tyreWear.frontLeft + telemetry.tyreWear.frontRight + 
               telemetry.tyreWear.rearLeft + telemetry.tyreWear.rearRight) / 4
            )}%
          </div>
        </div>

        <div className="glass-panel p-3">
          <div className="data-label text-[10px]">AVG TEMP</div>
          <div className={`text-xl font-bold font-mono ${getTyreColor(
            getTyreStatus(
              100,
              (telemetry.tyreTemp.frontLeft + telemetry.tyreTemp.frontRight + 
               telemetry.tyreTemp.rearLeft + telemetry.tyreTemp.rearRight) / 4
            )
          )}`}>
            {Math.round(
              (telemetry.tyreTemp.frontLeft + telemetry.tyreTemp.frontRight + 
               telemetry.tyreTemp.rearLeft + telemetry.tyreTemp.rearRight) / 4
            )}°C
          </div>
        </div>

        <div className="glass-panel p-3">
          <div className="data-label text-[10px]">GRIP LEVEL</div>
          <div className={`text-xl font-bold font-mono ${
            telemetry.gripLevel < 50 ? 'text-telemetry-red' :
            telemetry.gripLevel < 75 ? 'text-telemetry-amber' :
            'text-telemetry-green'
          }`}>
            {Math.round(telemetry.gripLevel)}%
          </div>
        </div>
      </div>

      {/* Degradation rate */}
      <div className="mt-4 glass-panel p-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-carbon-400 font-mono">DEGRADATION RATE</span>
          <span className="text-sm font-bold text-telemetry-amber">
            {telemetry.tyreDegradationRate.toFixed(2)}% / LAP
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Made with Bob
