import { create } from 'zustand';

export interface TelemetryData {
  // Core Vehicle Data
  speed: number;
  gear: number;
  rpm: number;
  throttle: number;
  brake: number;
  steeringAngle: number;
  drsStatus: boolean;
  ersDeployment: number;
  ersBattery: number;
  fuelRemaining: number;

  // Tyre Data
  tyreWear: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  tyreTemp: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  tyreCompound: string;
  gripLevel: number;

  // Session Data
  currentLap: number;
  lapTime: number;
  lastLapTime: number;
  bestLapTime: number;
  sector1Time: number;
  sector2Time: number;
  sector3Time: number;
  lapDelta: number;
  sessionMode: string;
  weatherCondition: string;
  trackTemp: number;
  airTemp: number;

  // Performance Analytics
  paceConsistency: number;
  tyreDegradationRate: number;
  fuelConsumptionRate: number;
  ersEfficiency: number;

  // AI Analysis
  aiPredictions: {
    tyreHealth: number;
    fuelOptimization: number;
    ersOptimization: number;
    pitStopConfidence: number;
    racePaceStability: number;
    overheatingRisk: number;
    aggressiveDrivingScore: number;
  };
  aiInsight: string;
  aiRecommendation: string;

  // Warnings
  showPitStopWarning: boolean;
  warningLevel: 'none' | 'warning' | 'critical';
  warningMessage: string;

  // Simulation
  simulationSpeed: number;
  isConnected: boolean;
}

interface TelemetryStore {
  telemetry: TelemetryData;
  updateTelemetry: (data: Partial<TelemetryData>) => void;
  resetTelemetry: () => void;
  setAIInsight: (insight: string, recommendation: string) => void;
  triggerPitStopWarning: (message: string, level: 'warning' | 'critical') => void;
  clearWarning: () => void;
}

const initialTelemetry: TelemetryData = {
  speed: 0,
  gear: 1,
  rpm: 0,
  throttle: 0,
  brake: 0,
  steeringAngle: 0,
  drsStatus: false,
  ersDeployment: 0,
  ersBattery: 100,
  fuelRemaining: 100,

  tyreWear: {
    frontLeft: 100,
    frontRight: 100,
    rearLeft: 100,
    rearRight: 100,
  },
  tyreTemp: {
    frontLeft: 80,
    frontRight: 80,
    rearLeft: 85,
    rearRight: 85,
  },
  tyreCompound: 'SOFT',
  gripLevel: 100,

  currentLap: 0,
  lapTime: 0,
  lastLapTime: 0,
  bestLapTime: 0,
  sector1Time: 0,
  sector2Time: 0,
  sector3Time: 0,
  lapDelta: 0,
  sessionMode: 'RACE',
  weatherCondition: 'DRY',
  trackTemp: 35,
  airTemp: 25,

  paceConsistency: 85,
  tyreDegradationRate: 0.5,
  fuelConsumptionRate: 1.2,
  ersEfficiency: 90,

  aiPredictions: {
    tyreHealth: 100,
    fuelOptimization: 85,
    ersOptimization: 90,
    pitStopConfidence: 0,
    racePaceStability: 88,
    overheatingRisk: 10,
    aggressiveDrivingScore: 45,
  },
  aiInsight: 'System initializing...',
  aiRecommendation: 'Awaiting telemetry data...',

  showPitStopWarning: false,
  warningLevel: 'none',
  warningMessage: '',

  simulationSpeed: 1.0,
  isConnected: false,
};

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  telemetry: initialTelemetry,

  updateTelemetry: (data) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...data },
    })),

  resetTelemetry: () =>
    set({ telemetry: initialTelemetry }),

  setAIInsight: (insight, recommendation) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        aiInsight: insight,
        aiRecommendation: recommendation,
      },
    })),

  triggerPitStopWarning: (message, level) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        showPitStopWarning: true,
        warningLevel: level,
        warningMessage: message,
      },
    })),

  clearWarning: () =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        showPitStopWarning: false,
        warningLevel: 'none',
        warningMessage: '',
      },
    })),
}));

// Made with Bob
