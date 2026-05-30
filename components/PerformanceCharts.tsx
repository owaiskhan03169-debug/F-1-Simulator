'use client';

import { motion } from 'framer-motion';
import { useTelemetryStore } from '@/lib/telemetryStore';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

export default function PerformanceCharts() {
  const { telemetry } = useTelemetryStore();
  const [paceData, setPaceData] = useState<any[]>([]);
  const [tyreWearData, setTyreWearData] = useState<any[]>([]);
  const [fuelData, setFuelData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate historical data collection
    const interval = setInterval(() => {
      const timestamp = Date.now();
      
      // Pace data
      setPaceData(prev => {
        const newData = [...prev, {
          time: timestamp,
          pace: telemetry.speed,
          target: 280,
        }].slice(-20);
        return newData;
      });

      // Tyre wear data
      setTyreWearData(prev => {
        const avgWear = (
          telemetry.tyreWear.frontLeft +
          telemetry.tyreWear.frontRight +
          telemetry.tyreWear.rearLeft +
          telemetry.tyreWear.rearRight
        ) / 4;
        const newData = [...prev, {
          lap: telemetry.currentLap,
          wear: avgWear,
        }].slice(-15);
        return newData;
      });

      // Fuel data
      setFuelData(prev => {
        const newData = [...prev, {
          lap: telemetry.currentLap,
          fuel: telemetry.fuelRemaining,
        }].slice(-15);
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [telemetry]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-2 border border-telemetry-cyan/30">
          <p className="text-xs text-carbon-400 font-mono">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Pace Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-4"
      >
        <h3 className="text-sm font-bold text-telemetry-cyan mb-3 font-mono">PACE TREND</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={paceData}>
            <defs>
              <linearGradient id="paceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis 
              dataKey="time" 
              stroke="#6f6f6f" 
              tick={{ fontSize: 10, fill: '#6f6f6f' }}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis 
              stroke="#6f6f6f" 
              tick={{ fontSize: 10, fill: '#6f6f6f' }}
              domain={[0, 350]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="pace" 
              stroke="#00d4ff" 
              strokeWidth={2}
              fill="url(#paceGradient)" 
              animationDuration={300}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#00ff88" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tyre Wear Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel p-4"
      >
        <h3 className="text-sm font-bold text-telemetry-amber mb-3 font-mono">TYRE WEAR PROGRESSION</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={tyreWearData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis 
              dataKey="lap" 
              stroke="#6f6f6f" 
              tick={{ fontSize: 10, fill: '#6f6f6f' }}
              label={{ value: 'Lap', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#6f6f6f' }}
            />
            <YAxis 
              stroke="#6f6f6f" 
              tick={{ fontSize: 10, fill: '#6f6f6f' }}
              domain={[0, 100]}
              label={{ value: 'Wear %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6f6f6f' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="wear" 
              stroke="#ffb800" 
              strokeWidth={2}
              dot={{ fill: '#ffb800', r: 3 }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Fuel Consumption */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel p-4"
      >
        <h3 className="text-sm font-bold text-telemetry-green mb-3 font-mono">FUEL CONSUMPTION</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={fuelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis 
              dataKey="lap" 
              stroke="#6f6f6f" 
              tick={{ fontSize: 10, fill: '#6f6f6f' }}
              label={{ value: 'Lap', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#6f6f6f' }}
            />
            <YAxis 
              stroke="#6f6f6f" 
              tick={{ fontSize: 10, fill: '#6f6f6f' }}
              domain={[0, 100]}
              label={{ value: 'Fuel %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6f6f6f' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="fuel" 
              fill="#00ff88" 
              animationDuration={300}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Session Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="glass-panel p-3">
          <div className="data-label text-[10px]">BEST LAP</div>
          <div className="text-xl font-bold font-mono text-telemetry-cyan">
            {telemetry.bestLapTime > 0 
              ? `${Math.floor(telemetry.bestLapTime / 60)}:${(telemetry.bestLapTime % 60).toFixed(3).padStart(6, '0')}`
              : '--:--.---'
            }
          </div>
        </div>

        <div className="glass-panel p-3">
          <div className="data-label text-[10px]">LAST LAP</div>
          <div className="text-xl font-bold font-mono text-white">
            {telemetry.lastLapTime > 0 
              ? `${Math.floor(telemetry.lastLapTime / 60)}:${(telemetry.lastLapTime % 60).toFixed(3).padStart(6, '0')}`
              : '--:--.---'
            }
          </div>
        </div>

        <div className="glass-panel p-3">
          <div className="data-label text-[10px]">LAP DELTA</div>
          <div className={`text-xl font-bold font-mono ${
            telemetry.lapDelta < 0 ? 'text-telemetry-green' : 'text-telemetry-red'
          }`}>
            {telemetry.lapDelta > 0 ? '+' : ''}{telemetry.lapDelta.toFixed(3)}
          </div>
        </div>

        <div className="glass-panel p-3">
          <div className="data-label text-[10px]">CONSISTENCY</div>
          <div className="text-xl font-bold font-mono text-telemetry-purple">
            {Math.round(telemetry.paceConsistency)}%
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Made with Bob
