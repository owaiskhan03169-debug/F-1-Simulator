'use client';

import { useEffect, useRef } from 'react';
import { useTelemetryStore } from './telemetryStore';

export function useLiveTelemetry() {
  const { updateTelemetry } = useTelemetryStore();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const backendUrl = 'wss://backendserver-production-d286.up.railway.app/ws';
    let reconnectTimer: NodeJS.Timeout;

    const mapBackendData = (raw: Record<string, unknown>) => {
      const tyreWear = raw.tyre_wear as number ?? 100;
      const fuel     = raw.fuel_remaining as number ?? 100;
      const ers      = raw.ers_battery as number ?? 100;
      const speed    = raw.speed_kmh as number ?? raw.speed as number ?? 0;
      const rpm      = raw.engine_rpm as number ?? raw.rpm as number ?? 0;
      const throttle = raw.throttle_percent as number ?? raw.throttle as number ?? 0;

      // Derive AI predictions from real telemetry values
      const tyreHealth        = Math.max(0, 100 - (tyreWear));
      const fuelOptimization  = Math.min(100, (fuel / 110) * 100);
      const ersOptimization   = ers;
      const pitStopConfidence = tyreWear > 70 ? 90 : tyreWear > 50 ? 60 : 20;
      const racePaceStability = Math.min(100, 100 - (raw.tyre_penalty_sec as number ?? 0) * 10);
      const overheatingRisk   = raw.overheating_risk as number ?? 10;
      const aggressiveDriving = Math.min(100, throttle * 0.9);

      return {
        // Core vehicle
        speed,
        gear:         raw.gear as number ?? 1,
        rpm,
        throttle,
        ersBattery:   ers,
        ersDeployment: raw.ers_deploy as number ?? 0,
        fuelRemaining: fuel,
        drsStatus:    raw.drs as boolean ?? false,

        // Tyre
        tyreWear: {
          frontLeft:  tyreWear,
          frontRight: tyreWear,
          rearLeft:   tyreWear + 2,
          rearRight:  tyreWear + 2,
        },
        tyreCompound: raw.compound as string ?? 'SOFT',
        gripLevel:    Math.round((raw.tyre_grip as number ?? 0.9) * 100),

        // Session
        currentLap:   raw.lap as number ?? 0,
        lapTime:      raw.lap_time as number ?? 0,
        sector1Time:  raw.sector_1 as number ?? 0,
        sector2Time:  raw.sector_2 as number ?? 0,
        sector3Time:  raw.sector_3 as number ?? 0,

        // AI Predictions — derived from real data
        aiPredictions: {
          tyreHealth,
          fuelOptimization,
          ersOptimization,
          pitStopConfidence,
          racePaceStability,
          overheatingRisk,
          aggressiveDrivingScore: aggressiveDriving,
        },

        isConnected: true,
      };
    };

    const connect = () => {
      try {
        console.log(`Connecting to ${backendUrl}...`);
        const ws = new WebSocket(backendUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Connected to F1 Telemetry Backend (Railway)');
          updateTelemetry({ isConnected: true });
        };

        ws.onmessage = (event) => {
          try {
            const raw = JSON.parse(event.data);
            if (raw.status === 'RACE_FINISHED') return;
            const mapped = mapBackendData(raw);
            updateTelemetry(mapped);
          } catch (e) {
            console.error('Failed to parse telemetry data', e);
          }
        };

        ws.onclose = () => {
          console.log('Disconnected. Retrying in 3s...');
          updateTelemetry({ isConnected: false });
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('WebSocket init error:', error);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [updateTelemetry]);
}