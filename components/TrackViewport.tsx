'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTelemetryStore } from '@/lib/telemetryStore';

export default function TrackViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { telemetry } = useTelemetryStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let roadOffset = 0;
    let barrierOffset = 0;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate speed-based movement
      const speedFactor = telemetry.speed / 100;
      roadOffset += speedFactor * 8;
      barrierOffset += speedFactor * 12;

      // Draw track background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(0.5, '#0f0f0f');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road lines (moving)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      const lineSpacing = 60;
      for (let i = -1; i < canvas.height / lineSpacing + 1; i++) {
        const y = (i * lineSpacing + roadOffset) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 80, y);
        ctx.lineTo(canvas.width / 2 - 80, y + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 80, y);
        ctx.lineTo(canvas.width / 2 + 80, y + 30);
        ctx.stroke();
      }

      // Draw track edges with glow
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 200, 0);
      ctx.lineTo(canvas.width / 2 - 200, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 + 200, 0);
      ctx.lineTo(canvas.width / 2 + 200, canvas.height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw barriers (moving faster for parallax effect)
      ctx.fillStyle = 'rgba(255, 59, 59, 0.4)';
      const barrierSpacing = 40;
      for (let i = -1; i < canvas.height / barrierSpacing + 2; i++) {
        const y = (i * barrierSpacing + barrierOffset) % canvas.height;
        // Left barriers
        ctx.fillRect(canvas.width / 2 - 220, y, 15, 20);
        // Right barriers
        ctx.fillRect(canvas.width / 2 + 205, y, 15, 20);
      }

      // Draw DETAILED RED F1 CAR (top-down view)
      const carX = canvas.width / 2;
      const carY = canvas.height * 0.65;
      const steeringOffset = telemetry.steeringAngle * 0.5;

      ctx.save();
      ctx.translate(carX + steeringOffset, carY);

      // Car shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-35, 8, 70, 90);

      // === REAR WING ===
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-32, 45, 64, 8);
      // Wing endplates
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-35, 43, 6, 12);
      ctx.fillRect(29, 43, 6, 12);
      // DRS indicator
      if (telemetry.drsStatus) {
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(-28, 47, 56, 3);
      }

      // === REAR TYRES (BLACK with temperature indicators) ===
      const getTyreColor = (temp: number) => {
        if (temp > 100) return '#ff3b3b';
        if (temp > 90) return '#ffb800';
        return '#00ff88';
      };
      
      // Rear Left Tyre
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(-38, 20, 12, 25);
      ctx.fillStyle = getTyreColor(telemetry.tyreTemp.rearLeft);
      ctx.fillRect(-38, 20, 3, 25);
      
      // Rear Right Tyre
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(26, 20, 12, 25);
      ctx.fillStyle = getTyreColor(telemetry.tyreTemp.rearRight);
      ctx.fillRect(35, 20, 3, 25);

      // === MAIN CHASSIS (RED) ===
      // Rear section
      const redGradient = ctx.createLinearGradient(-30, 0, 30, 0);
      redGradient.addColorStop(0, '#8b0000');
      redGradient.addColorStop(0.5, '#ff0000');
      redGradient.addColorStop(1, '#8b0000');
      ctx.fillStyle = redGradient;
      ctx.fillRect(-30, 15, 60, 30);

      // Engine cover (darker red)
      ctx.fillStyle = '#cc0000';
      ctx.fillRect(-28, 10, 56, 5);

      // Sidepods (RED)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-32, -5, 12, 20);
      ctx.fillRect(20, -5, 12, 20);

      // Cockpit/Halo area
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-20, -10, 40, 20);
      
      // Halo (safety structure)
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI, true);
      ctx.stroke();

      // Driver helmet (visible through halo)
      ctx.fillStyle = '#ffb800';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // === FRONT TYRES (BLACK with temperature indicators) ===
      // Front Left Tyre
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(-38, -35, 12, 25);
      ctx.fillStyle = getTyreColor(telemetry.tyreTemp.frontLeft);
      ctx.fillRect(-38, -35, 3, 25);
      
      // Front Right Tyre
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(26, -35, 12, 25);
      ctx.fillStyle = getTyreColor(telemetry.tyreTemp.frontRight);
      ctx.fillRect(35, -35, 3, 25);

      // === NOSE CONE (RED) ===
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(-25, -15);
      ctx.lineTo(-15, -40);
      ctx.lineTo(15, -40);
      ctx.lineTo(25, -15);
      ctx.closePath();
      ctx.fill();

      // Nose tip
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-12, -42, 24, 4);

      // === FRONT WING ===
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-40, -48, 80, 6);
      // Wing endplates
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-42, -50, 6, 10);
      ctx.fillRect(36, -50, 6, 10);
      
      // Wing elements (multiple layers)
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-35, -46);
      ctx.lineTo(35, -46);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-35, -44);
      ctx.lineTo(35, -44);
      ctx.stroke();

      // === DETAILS & ACCENTS ===
      // Red racing stripes
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-3, -15, 6, 30);
      
      // Sponsor decals (white rectangles)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(-25, 25, 15, 3);
      ctx.fillRect(10, 25, 15, 3);

      // === ERS GLOW EFFECT ===
      if (telemetry.ersDeployment > 0) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = `rgba(0, 255, 136, ${telemetry.ersDeployment / 100})`;
        ctx.strokeStyle = `rgba(0, 255, 136, ${telemetry.ersDeployment / 100})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(-30, -40, 60, 85);
        ctx.shadowBlur = 0;
      }

      // === BRAKE GLOW ===
      if (telemetry.brake > 50) {
        ctx.fillStyle = `rgba(255, 59, 59, ${telemetry.brake / 150})`;
        // Rear brake glow
        ctx.fillRect(-35, 42, 10, 4);
        ctx.fillRect(25, 42, 10, 4);
      }

      ctx.restore();

      // Speed blur effect
      if (telemetry.speed > 200) {
        ctx.fillStyle = `rgba(0, 212, 255, ${(telemetry.speed - 200) / 1000})`;
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 2);
        }
      }

      // Brake effect
      if (telemetry.brake > 50) {
        ctx.fillStyle = `rgba(255, 59, 59, ${telemetry.brake / 200})`;
        ctx.fillRect(carX - 30, carY + 35, 60, 5);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [telemetry]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[400px] glass-panel overflow-hidden"
    >
      {/* Scan line effect */}
      <div className="scan-line" />
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
      />

      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="glass-panel px-3 py-1 text-xs font-mono">
          <span className="text-telemetry-cyan">SPEED:</span>{' '}
          <span className="text-white font-bold">{Math.round(telemetry.speed)} KM/H</span>
        </div>
        <div className="glass-panel px-3 py-1 text-xs font-mono">
          <span className="text-telemetry-cyan">GEAR:</span>{' '}
          <span className="text-white font-bold">{telemetry.gear}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 space-y-2">
        <div className="glass-panel px-3 py-1 text-xs font-mono">
          <span className="text-telemetry-green">DRS:</span>{' '}
          <span className={telemetry.drsStatus ? 'text-telemetry-green' : 'text-carbon-500'}>
            {telemetry.drsStatus ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        <div className="glass-panel px-3 py-1 text-xs font-mono">
          <span className="text-telemetry-green">ERS:</span>{' '}
          <span className="text-white font-bold">{Math.round(telemetry.ersDeployment)}%</span>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-4 left-4 right-4 glass-panel px-4 py-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <div>
            <span className="text-carbon-400">LAP:</span>{' '}
            <span className="text-white font-bold">{telemetry.currentLap}</span>
          </div>
          <div>
            <span className="text-carbon-400">THROTTLE:</span>{' '}
            <span className="text-telemetry-green">{Math.round(telemetry.throttle)}%</span>
          </div>
          <div>
            <span className="text-carbon-400">BRAKE:</span>{' '}
            <span className="text-telemetry-red">{Math.round(telemetry.brake)}%</span>
          </div>
          <div>
            <span className="text-carbon-400">FUEL:</span>{' '}
            <span className="text-white">{Math.round(telemetry.fuelRemaining)}%</span>
          </div>
        </div>
      </div>

      {/* Corner indicator */}
      {Math.abs(telemetry.steeringAngle) > 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="text-telemetry-amber text-6xl font-bold opacity-30">
            {telemetry.steeringAngle > 0 ? '→' : '←'}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Made with Bob
