'use client';

import { useEffect, useRef } from 'react';
import { useTelemetryStore } from './telemetryStore';

export function useSimulator() {
  const { updateTelemetry, setAIInsight, triggerPitStopWarning } = useTelemetryStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lapProgressRef = useRef(0);
  const currentLapRef = useRef(1);

  useEffect(() => {
    // Simulate telemetry data updates
    let speed = 0;
    let targetSpeed = 280;
    let gear = 1;
    let rpm = 0;
    let throttle = 0;
    let brake = 0;
    let steeringAngle = 0;
    let ersDeployment = 0;
    let ersBattery = 100;
    let fuelRemaining = 100;
    let lapTime = 0;
    
    // Tyre wear simulation
    let tyreWear = {
      frontLeft: 100,
      frontRight: 100,
      rearLeft: 100,
      rearRight: 100,
    };

    let tyreTemp = {
      frontLeft: 80,
      frontRight: 80,
      rearLeft: 85,
      rearRight: 85,
    };

    updateTelemetry({ isConnected: true });

    intervalRef.current = setInterval(() => {
      // Simulate lap progress
      lapProgressRef.current += 0.5;
      lapTime += 0.1;

      if (lapProgressRef.current >= 100) {
        lapProgressRef.current = 0;
        currentLapRef.current += 1;
        lapTime = 0;
      }

      // Simulate speed variations (racing line)
      const lapPhase = lapProgressRef.current / 100;
      if (lapPhase < 0.2) {
        // Straight - accelerate
        targetSpeed = 320;
        throttle = Math.min(100, throttle + 5);
        brake = Math.max(0, brake - 10);
        steeringAngle = Math.max(-5, steeringAngle - 2);
      } else if (lapPhase < 0.3) {
        // Braking zone
        targetSpeed = 120;
        throttle = Math.max(0, throttle - 20);
        brake = Math.min(100, brake + 15);
        steeringAngle = 0;
      } else if (lapPhase < 0.5) {
        // Corner
        targetSpeed = 150;
        throttle = Math.min(60, throttle + 3);
        brake = Math.max(0, brake - 10);
        steeringAngle = -35 + Math.random() * 10;
      } else if (lapPhase < 0.7) {
        // Exit corner - accelerate
        targetSpeed = 280;
        throttle = Math.min(100, throttle + 8);
        brake = 0;
        steeringAngle = Math.min(5, steeringAngle + 3);
      } else if (lapPhase < 0.8) {
        // Another corner
        targetSpeed = 180;
        throttle = Math.max(40, throttle - 10);
        brake = Math.min(80, brake + 10);
        steeringAngle = 30 + Math.random() * 10;
      } else {
        // Final straight
        targetSpeed = 310;
        throttle = Math.min(100, throttle + 6);
        brake = 0;
        steeringAngle = Math.max(-5, steeringAngle - 2);
      }

      // Smooth speed transition
      speed = speed + (targetSpeed - speed) * 0.1;

      // Calculate gear based on speed
      if (speed < 50) gear = 1;
      else if (speed < 100) gear = 2;
      else if (speed < 150) gear = 3;
      else if (speed < 200) gear = 4;
      else if (speed < 250) gear = 5;
      else if (speed < 290) gear = 6;
      else if (speed < 320) gear = 7;
      else gear = 8;

      // RPM based on gear and speed
      rpm = 8000 + (speed / 350) * 7000 + Math.random() * 500;

      // ERS simulation
      if (throttle > 80 && ersBattery > 20) {
        ersDeployment = Math.min(100, ersDeployment + 5);
        ersBattery = Math.max(0, ersBattery - 0.3);
      } else {
        ersDeployment = Math.max(0, ersDeployment - 3);
        if (throttle < 50) {
          ersBattery = Math.min(100, ersBattery + 0.5);
        }
      }

      // Fuel consumption
      fuelRemaining = Math.max(0, fuelRemaining - 0.05);

      // Tyre degradation (faster with aggressive driving)
      const degradationRate = (throttle / 100) * 0.02 + (Math.abs(steeringAngle) / 90) * 0.01;
      tyreWear.frontLeft = Math.max(0, tyreWear.frontLeft - degradationRate * 1.2);
      tyreWear.frontRight = Math.max(0, tyreWear.frontRight - degradationRate * 1.2);
      tyreWear.rearLeft = Math.max(0, tyreWear.rearLeft - degradationRate);
      tyreWear.rearRight = Math.max(0, tyreWear.rearRight - degradationRate);

      // Tyre temperature (increases with speed and cornering)
      const tempIncrease = (speed / 350) * 0.5 + (Math.abs(steeringAngle) / 90) * 0.3;
      tyreTemp.frontLeft = Math.min(120, tyreTemp.frontLeft + tempIncrease - 0.2);
      tyreTemp.frontRight = Math.min(120, tyreTemp.frontRight + tempIncrease - 0.2);
      tyreTemp.rearLeft = Math.min(120, tyreTemp.rearLeft + tempIncrease - 0.15);
      tyreTemp.rearRight = Math.min(120, tyreTemp.rearRight + tempIncrease - 0.15);

      // Calculate AI predictions
      const avgTyreWear = (tyreWear.frontLeft + tyreWear.frontRight + tyreWear.rearLeft + tyreWear.rearRight) / 4;
      const avgTyreTemp = (tyreTemp.frontLeft + tyreTemp.frontRight + tyreTemp.rearLeft + tyreTemp.rearRight) / 4;
      const overheatingRisk = Math.max(0, (avgTyreTemp - 90) * 3);
      const pitStopConfidence = Math.max(0, 100 - avgTyreWear);
      const aggressiveDrivingScore = (throttle * 0.3 + Math.abs(steeringAngle) * 0.7 + brake * 0.2) / 2;

      // Update telemetry
      updateTelemetry({
        speed,
        gear,
        rpm,
        throttle,
        brake,
        steeringAngle,
        drsStatus: speed > 250 && throttle > 90,
        ersDeployment,
        ersBattery,
        fuelRemaining,
        tyreWear,
        tyreTemp,
        gripLevel: avgTyreWear * 0.8,
        currentLap: currentLapRef.current,
        lapTime,
        tyreDegradationRate: degradationRate * 100,
        aiPredictions: {
          tyreHealth: avgTyreWear,
          fuelOptimization: fuelRemaining > 50 ? 85 : 65,
          ersOptimization: ersBattery > 50 ? 90 : 70,
          pitStopConfidence,
          racePaceStability: 88 - (aggressiveDrivingScore * 0.2),
          overheatingRisk,
          aggressiveDrivingScore,
        },
      });

      // AI insights
      if (avgTyreWear < 40) {
        setAIInsight(
          `Critical tyre degradation detected. Front-left at ${Math.round(tyreWear.frontLeft)}%. Rear-left at ${Math.round(tyreWear.rearLeft)}%. Grip loss imminent.`,
          'IMMEDIATE PITSTOP REQUIRED - Tyre integrity compromised'
        );
        triggerPitStopWarning(
          'Tyre wear critical. Grip loss exceeds safe threshold. Immediate pitstop required.',
          'critical'
        );
      } else if (avgTyreTemp > 105) {
        setAIInsight(
          `Thermal degradation increasing. Average tyre temperature: ${Math.round(avgTyreTemp)}°C. Overheating risk: ${Math.round(overheatingRisk)}%.`,
          'REDUCE PACE - Thermal management critical'
        );
        triggerPitStopWarning(
          'Tyre overheating detected. Predicted grip loss within 2 laps. Consider pitstop.',
          'warning'
        );
      } else if (avgTyreWear < 60) {
        setAIInsight(
          `Tyre wear progressing as expected. Current degradation rate: ${degradationRate.toFixed(3)}% per lap. Optimal pit window approaching.`,
          'MONITOR CLOSELY - Prepare for pitstop within 3-5 laps'
        );
      } else {
        setAIInsight(
          `All systems nominal. Tyre health: ${Math.round(avgTyreWear)}%. ERS efficiency: ${Math.round(ersBattery)}%. Pace stable.`,
          'MAINTAIN CURRENT STRATEGY - Performance optimal'
        );
      }
    }, 100); // Update every 100ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      updateTelemetry({ isConnected: false });
    };
  }, [updateTelemetry, setAIInsight, triggerPitStopWarning]);
}

// Made with Bob
