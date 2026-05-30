'use client';

import { motion } from 'framer-motion';
import { useTelemetryStore } from '@/lib/telemetryStore';

export default function TelemetryPanels() {
  const { telemetry } = useTelemetryStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {/* Speed */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">SPEED</div>
        <div className="data-value text-telemetry-cyan">
          {Math.round(telemetry.speed)}
        </div>
        <div className="text-xs text-carbon-400 font-mono">KM/H</div>
        <div className="progress-bar mt-2">
          <div
            className="progress-fill"
            style={{ width: `${(telemetry.speed / 350) * 100}%` }}
          />
        </div>
      </motion.div>

      {/* RPM */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">RPM</div>
        <div className="data-value text-telemetry-orange">
          {Math.round(telemetry.rpm)}
        </div>
        <div className="text-xs text-carbon-400 font-mono">REV/MIN</div>
        <div className="progress-bar mt-2">
          <div
            className="progress-fill bg-gradient-to-r from-telemetry-orange to-telemetry-red"
            style={{ width: `${(telemetry.rpm / 15000) * 100}%` }}
          />
        </div>
      </motion.div>

      {/* Gear */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">GEAR</div>
        <div className="data-value text-white">
          {telemetry.gear === 0 ? 'N' : telemetry.gear}
        </div>
        <div className="text-xs text-carbon-400 font-mono">CURRENT</div>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
            <div
              key={g}
              className={`h-1 flex-1 rounded ${
                g <= telemetry.gear ? 'bg-telemetry-cyan' : 'bg-carbon-800'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Throttle */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">THROTTLE</div>
        <div className="data-value text-telemetry-green">
          {Math.round(telemetry.throttle)}
        </div>
        <div className="text-xs text-carbon-400 font-mono">PERCENT</div>
        <div className="progress-bar mt-2">
          <div
            className="progress-fill bg-telemetry-green"
            style={{ width: `${telemetry.throttle}%` }}
          />
        </div>
      </motion.div>

      {/* Brake */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">BRAKE</div>
        <div className="data-value text-telemetry-red">
          {Math.round(telemetry.brake)}
        </div>
        <div className="text-xs text-carbon-400 font-mono">PRESSURE</div>
        <div className="progress-bar mt-2">
          <div
            className="progress-fill bg-telemetry-red"
            style={{ width: `${telemetry.brake}%` }}
          />
        </div>
      </motion.div>

      {/* Steering */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">STEERING</div>
        <div className="data-value text-telemetry-purple">
          {Math.round(telemetry.steeringAngle)}°
        </div>
        <div className="text-xs text-carbon-400 font-mono">ANGLE</div>
        <div className="flex items-center justify-center mt-2 h-8">
          <div className="relative w-full h-1 bg-carbon-800 rounded">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-telemetry-purple rounded transition-all"
              style={{
                left: `${50 + (telemetry.steeringAngle / 90) * 50}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ERS Battery */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">ERS BATTERY</div>
        <div className="data-value text-telemetry-green">
          {Math.round(telemetry.ersBattery)}
        </div>
        <div className="text-xs text-carbon-400 font-mono">PERCENT</div>
        <div className="progress-bar mt-2">
          <div
            className="progress-fill bg-gradient-to-r from-telemetry-green to-telemetry-cyan"
            style={{ width: `${telemetry.ersBattery}%` }}
          />
        </div>
      </motion.div>

      {/* Fuel */}
      <motion.div variants={itemVariants} className="telemetry-card">
        <div className="data-label">FUEL</div>
        <div
          className={`data-value ${
            telemetry.fuelRemaining < 20
              ? 'text-telemetry-red'
              : telemetry.fuelRemaining < 40
              ? 'text-telemetry-amber'
              : 'text-telemetry-green'
          }`}
        >
          {Math.round(telemetry.fuelRemaining)}
        </div>
        <div className="text-xs text-carbon-400 font-mono">REMAINING</div>
        <div className="progress-bar mt-2">
          <div
            className={`progress-fill ${
              telemetry.fuelRemaining < 20
                ? 'bg-telemetry-red'
                : telemetry.fuelRemaining < 40
                ? 'bg-telemetry-amber'
                : 'bg-telemetry-green'
            }`}
            style={{ width: `${telemetry.fuelRemaining}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Made with Bob
