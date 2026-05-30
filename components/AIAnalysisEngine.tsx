'use client';

import { motion } from 'framer-motion';
import { useTelemetryStore } from '@/lib/telemetryStore';
import { useEffect, useState, useRef } from 'react';

// Insight templates — rotate so same text never repeats twice in a row
const INSIGHT_TEMPLATES = {
  criticalTyre: [
    'Box box box — tyre degradation critical, structural failure risk imminent.',
    'Immediate pit stop required — tyre compound beyond operating limit.',
    'Box this lap — grip loss severe, continuing risks race retirement.',
  ],
  warningTyre: [
    (deg: number) => `Tyre wear at ${deg}% degradation — entering the pit window now.`,
    (deg: number) => `${deg}% tyre degradation confirmed — prepare pit crew for imminent stop.`,
    (deg: number) => `Graining detected at ${deg}% wear — pit window opening next 2 laps.`,
  ],
  overheat: [
    'Rear tyre overheating detected — reduce throttle on corner exit.',
    'Thermal degradation accelerating — lift and coast through sector 2.',
    'Overheating warning — back off 5% throttle to stabilise tyre temps.',
  ],
  lowERS: [
    'ERS battery critical — switch to harvest mode on next straight immediately.',
    'Battery at limit — no ERS deployment until above 55%. Harvest sector 2.',
    'ERS depleted — conserve deployment, prioritise harvesting through braking zones.',
  ],
  lowFuel: [
    'Fuel consumption above target delta — lift and coast recommended.',
    'Fuel window tightening — reduce pace 0.15s per lap through final sector.',
    'Marginal fuel load — switch to mix 3, lift at 200m board on back straight.',
  ],
  pitWindow: [
    'Pit window optimal — undercut opportunity open against rival ahead.',
    'Box now for undercut — 4 second gap to traffic, clean air on out lap.',
    'Strategic window open — pit this lap to jump P2 on fresher compound.',
  ],
  aggressive: [
    'Aggressive inputs detected — flat-spot risk on front left under heavy braking.',
    'High aggression score — reduce brake pressure 15% into turns 1 and 3.',
    'Driving style too aggressive — protect front tyres for final stint push.',
  ],
  optimal: [
    (t: number, e: number, f: number) => `Car in optimal window — tyre ${t}%, ERS ${e}%, fuel ${f}%. Maintain pace.`,
    (t: number, e: number, f: number) => `All systems nominal — tyre health ${t}%, battery ${e}%, fuel ${f}%. Push push push.`,
    (t: number, e: number, f: number) => `Performance window green — ${t}% tyre life remaining, ${e}% ERS available. Hold position.`,
  ],
};

const STRATEGY_MAP = {
  criticalTyre: '🔴 BOX THIS LAP — Fit medium compound for final stint.',
  warningTyre:  '🟡 Prepare pit crew. Box within 2 laps for best track position.',
  overheat:     '🟡 Lift and coast on back straight. Reduce ERS deployment by 20%.',
  lowERS:       '⚡ No ERS deployment until battery above 55%. Harvest through sector 2.',
  lowFuel:      '⛽ Fuel save mode. Target 0.15s slower per lap through final sector.',
  pitWindow:    '🟢 UNDERCUT NOW — pit this lap, clean air advantage on out lap.',
  aggressive:   '🟡 Reduce brake aggression 15%. Protect front tyres for final 10 laps.',
  optimal:      '🟢 Maintain pace. Execute current strategy — no action required.',
};

let lastInsightIndex = -1;
function pickTemplate<T extends ((...args: never[]) => string) | string>(
  arr: T[], ...args: number[]
): string {
  let idx = Math.floor(Math.random() * arr.length);
  if (idx === lastInsightIndex) idx = (idx + 1) % arr.length;
  lastInsightIndex = idx;
  const item = arr[idx];
  return typeof item === 'function' ? (item as (...a: number[]) => string)(...args) : item as string;
}

function getInsight(p: Record<string, number>): { insight: string; strategy: string; category: string } {
  const tyre = p.tyreHealth        ?? 80;
  const fuel = p.fuelOptimization  ?? 70;
  const ers  = p.ersOptimization   ?? 75;
  const pit  = p.pitStopConfidence ?? 20;
  const heat = p.overheatingRisk   ?? 10;
  const aggr = p.aggressiveDrivingScore ?? 45;
  const deg  = Math.round(100 - tyre);

  if (tyre < 25) return { insight: pickTemplate(INSIGHT_TEMPLATES.criticalTyre), strategy: STRATEGY_MAP.criticalTyre, category: 'critical' };
  if (tyre < 45) return { insight: pickTemplate(INSIGHT_TEMPLATES.warningTyre, deg), strategy: STRATEGY_MAP.warningTyre, category: 'warning' };
  if (heat > 72) return { insight: pickTemplate(INSIGHT_TEMPLATES.overheat),    strategy: STRATEGY_MAP.overheat,    category: 'warning' };
  if (ers  < 35) return { insight: pickTemplate(INSIGHT_TEMPLATES.lowERS),      strategy: STRATEGY_MAP.lowERS,      category: 'warning' };
  if (fuel < 35) return { insight: pickTemplate(INSIGHT_TEMPLATES.lowFuel),     strategy: STRATEGY_MAP.lowFuel,     category: 'warning' };
  if (pit  > 80) return { insight: pickTemplate(INSIGHT_TEMPLATES.pitWindow),   strategy: STRATEGY_MAP.pitWindow,   category: 'optimal' };
  if (aggr > 72) return { insight: pickTemplate(INSIGHT_TEMPLATES.aggressive),  strategy: STRATEGY_MAP.aggressive,  category: 'warning' };
  return {
    insight:  pickTemplate(INSIGHT_TEMPLATES.optimal, Math.round(tyre), Math.round(ers), Math.round(fuel)),
    strategy: STRATEGY_MAP.optimal,
    category: 'optimal',
  };
}

export default function AIAnalysisEngine() {
  const { telemetry } = useTelemetryStore();
  const [liveAiInsight, setLiveAiInsight] = useState('Waiting for telemetry data...');
  const [liveStrategy,  setLiveStrategy]  = useState('Connecting to AI engine...');
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const lastLapRef = useRef<number>(-1);

  const predictions     = telemetry?.aiPredictions ?? {};
  const tyreHealth        = predictions.tyreHealth        ?? 80;
  const ersOptimization   = predictions.ersOptimization   ?? 75;
  const fuelOptimization  = predictions.fuelOptimization  ?? 70;
  const pitStopConfidence = predictions.pitStopConfidence ?? 30;
  const racePaceStability = predictions.racePaceStability ?? 85;
  const overheatingRisk   = predictions.overheatingRisk   ?? 10;
  const aggressiveDriving = predictions.aggressiveDrivingScore ?? 45;
  const currentLap        = telemetry?.currentLap ?? 0;

  useEffect(() => {
    if (!telemetry?.aiPredictions) return;
    if (currentLap === lastLapRef.current) return;
    lastLapRef.current = currentLap;

    setIsAnalyzing(true);
    setTimeout(() => {
      const { insight, strategy } = getInsight(predictions as Record<string, number>);
      setLiveAiInsight(insight);
      setLiveStrategy(strategy);
      setIsAnalyzing(false);
    }, 900);
  }, [currentLap, telemetry?.aiPredictions]);

  const metrics = [
    { label: 'Tyre Health',        value: tyreHealth,        icon: '🛞',
      status: tyreHealth < 40 ? 'critical' : tyreHealth < 70 ? 'warning' : 'optimal' },
    { label: 'ERS Efficiency',     value: ersOptimization,   icon: '⚡',
      status: ersOptimization < 60 ? 'warning' : 'optimal' },
    { label: 'Fuel Optimization',  value: fuelOptimization,  icon: '⛽',
      status: fuelOptimization < 60 ? 'warning' : 'optimal' },
    { label: 'Pitstop Confidence', value: pitStopConfidence, icon: '🔧',
      status: pitStopConfidence > 80 ? 'critical' : pitStopConfidence > 50 ? 'warning' : 'optimal' },
    { label: 'Race Pace Stability',value: racePaceStability, icon: '📊',
      status: racePaceStability < 60 ? 'warning' : 'optimal' },
    { label: 'Overheating Risk',   value: overheatingRisk,   icon: '🌡️',
      status: overheatingRisk > 70 ? 'critical' : overheatingRisk > 40 ? 'warning' : 'optimal' },
  ];

  const getStatusColor = (s: string) =>
    s === 'critical' ? 'text-telemetry-red' : s === 'warning' ? 'text-telemetry-amber' : 'text-telemetry-green';
  const getStatusBg = (s: string) =>
    s === 'critical' ? 'bg-telemetry-red/20 border-telemetry-red/50' :
    s === 'warning'  ? 'bg-telemetry-amber/20 border-telemetry-amber/50' :
    'bg-telemetry-green/20 border-telemetry-green/50';

  const pitBorderColor = pitStopConfidence > 80 ? 'border-telemetry-red/50 bg-telemetry-red/10'
    : pitStopConfidence > 50 ? 'border-telemetry-amber/50 bg-telemetry-amber/10'
    : 'border-telemetry-green/50 bg-telemetry-green/10';
  const pitTextColor = pitStopConfidence > 80 ? 'text-telemetry-red'
    : pitStopConfidence > 50 ? 'text-telemetry-amber' : 'text-telemetry-green';
  const pitGradColor = pitStopConfidence > 80 ? 'via-telemetry-red'
    : pitStopConfidence > 50 ? 'via-telemetry-amber' : 'via-telemetry-green';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gradient flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI ANALYSIS ENGINE
          </h2>
          <p className="text-xs text-carbon-400 font-mono mt-1">Race Intelligence System</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-telemetry-cyan animate-pulse' : 'bg-telemetry-green'}`} />
          <span className="text-xs text-carbon-400 font-mono">{isAnalyzing ? 'ANALYZING' : 'ACTIVE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {metrics.map((metric, index) => (
          <motion.div key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-panel p-3 border ${getStatusBg(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{metric.icon}</span>
              <span className={`text-2xl font-bold font-mono ${getStatusColor(metric.status)}`}>
                {Math.round(metric.value)}%
              </span>
            </div>
            <div className="text-xs text-carbon-400 font-mono">{metric.label}</div>
            <div className="mt-2 h-1 bg-carbon-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${metric.value}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`h-full ${
                  metric.status === 'critical' ? 'bg-telemetry-red' :
                  metric.status === 'warning'  ? 'bg-telemetry-amber' : 'bg-telemetry-green'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-4 mb-4 border border-telemetry-cyan/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-telemetry-cyan to-transparent" />
        <div className="data-label mb-2">AI INSIGHT</div>
        <motion.p key={liveAiInsight} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-sm text-carbon-200 font-mono leading-relaxed">
          {liveAiInsight}
        </motion.p>
      </div>

      <div className={`glass-panel p-4 border ${pitBorderColor} relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent ${pitGradColor} to-transparent`} />
        <div className="data-label mb-2">STRATEGIC RECOMMENDATION</div>
        <motion.p key={liveStrategy} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-mono leading-relaxed font-semibold ${pitTextColor}`}>
          {liveStrategy}
        </motion.p>
      </div>

      <div className="mt-4 glass-panel p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-carbon-400 font-mono">DRIVING AGGRESSION</span>
          <span className={`text-sm font-bold font-mono ${
            aggressiveDriving > 70 ? 'text-telemetry-red' :
            aggressiveDriving > 50 ? 'text-telemetry-amber' : 'text-telemetry-green'
          }`}>{Math.round(aggressiveDriving)}%</span>
        </div>
        <div className="h-2 bg-carbon-800 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-300 ${
            aggressiveDriving > 70 ? 'bg-telemetry-red' :
            aggressiveDriving > 50 ? 'bg-telemetry-amber' : 'bg-telemetry-green'
          }`} style={{ width: `${aggressiveDriving}%` }} />
        </div>
      </div>

      {isAnalyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute bottom-4 right-4 flex items-center gap-2 glass-panel px-3 py-1">
          <div className="flex gap-1">
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div key={i} animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay }}
                className="w-1.5 h-1.5 bg-telemetry-cyan rounded-full" />
            ))}
          </div>
          <span className="text-xs text-telemetry-cyan font-mono">Processing</span>
        </motion.div>
      )}
    </motion.div>
  );
}