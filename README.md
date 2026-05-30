# 🏎️ F1 Race Command Center - IBM watsonx AI

An ultra-premium, enterprise-grade AI-powered Formula 1 telemetry monitoring and race strategy system.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![AI](https://img.shields.io/badge/AI-IBM%20watsonx-cyan)

## 🎯 Overview

This is a real-time AI telemetry monitoring and race strategy system designed to look and feel like a professional Formula 1 engineering control room. Built with enterprise-grade aesthetics combining IBM watsonx dashboard design with motorsport telemetry systems.

### Key Features

- **🎮 Live Track Viewport** - Cinematic F1 car simulation with dynamic environment
- **📊 Real-Time Telemetry** - Speed, RPM, gear, throttle, brake, steering, ERS, fuel
- **🛞 Tyre Monitoring** - Live wear, temperature, grip level, and degradation tracking
- **🤖 AI Analysis Engine** - Ifrah AI v2.0 with predictive analytics
- **📈 Performance Charts** - Pace trends, tyre wear progression, fuel consumption
- **⚠️ Pitstop Warning System** - Critical alerts with animated warnings
- **🎨 Premium UI/UX** - Glassmorphism, smooth animations, enterprise aesthetics
- **🔊 Audio Immersion** - Warning sounds and telemetry alerts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [https://backendserver-2eul.onrender.com/](https://backendserver-2eul.onrender.com/) to view the dashboard.

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand
- **Real-time Data**: WebSocket ready (demo mode included)

### Project Structure

```
f1-sim/
├── app/
│   ├── globals.css          # Global styles & design system
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main dashboard
├── components/
│   ├── TrackViewport.tsx     # Live F1 car simulation
│   ├── TelemetryPanels.tsx   # Core telemetry displays
│   ├── TyreMonitoring.tsx    # Tyre health visualization
│   ├── AIAnalysisEngine.tsx  # AI predictions & insights
│   ├── PerformanceCharts.tsx # Analytics charts
│   └── PitStopWarning.tsx    # Alert system
├── lib/
│   ├── telemetryStore.ts     # Zustand state management
│   └── useSimulator.ts       # Demo data simulator
└── public/                   # Static assets
```

## 🎨 Design System

### Color Palette

- **Primary**: Matte black, graphite gray, carbon fiber
- **Accents**: 
  - Cyan (`#00d4ff`) - Primary telemetry
  - Green (`#00ff88`) - Optimal status
  - Amber (`#ffb800`) - Warning
  - Red (`#ff3b3b`) - Critical
  - Orange (`#ff6b35`) - Performance
  - Purple (`#a855f7`) - Analytics

### Typography

- **Primary**: IBM Plex Sans
- **Monospace**: IBM Plex Mono (telemetry data)

## 🔌 Integration Guide

### Connecting to Real Telemetry

Replace the `useSimulator` hook with your WebSocket connection:

```typescript
// lib/useTelemetry.ts
import { useEffect } from 'react';
import { useTelemetryStore } from './telemetryStore';

export function useTelemetry() {
  const { updateTelemetry } = useTelemetryStore();

  useEffect(() => {
    const ws = new WebSocket('ws://f1-strategy-simulator-p015.onrender.com/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateTelemetry(data);
    };

    return () => ws.close();
  }, []);
}
```

### Expected Data Format

```typescript
{
  speed: number;           // km/h
  gear: number;            // 1-8
  rpm: number;             // revolutions per minute
  throttle: number;        // 0-100%
  brake: number;           // 0-100%
  steeringAngle: number;   // -90 to 90 degrees
  drsStatus: boolean;
  ersDeployment: number;   // 0-100%
  ersBattery: number;      // 0-100%
  fuelRemaining: number;   // 0-100%
  tyreWear: {
    frontLeft: number;     // 0-100%
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  tyreTemp: {
    frontLeft: number;     // °C
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  // ... additional fields
}
```

## 🤖 AI Analysis (Ifrah AI)

The AI engine analyzes:

- **Tyre Health**: Wear patterns and degradation prediction
- **ERS Efficiency**: Energy recovery optimization
- **Fuel Optimization**: Consumption rate analysis
- **Pitstop Confidence**: Strategic timing recommendations
- **Race Pace Stability**: Consistency metrics
- **Overheating Risk**: Thermal management alerts
- **Aggressive Driving**: Driving style analysis

## 📊 Performance Optimization

- **Update Rate**: 10Hz (100ms intervals)
- **Canvas Rendering**: Optimized with requestAnimationFrame
- **State Management**: Zustand for minimal re-renders
- **Chart Updates**: Throttled data collection
- **Animations**: Hardware-accelerated with Framer Motion

## 🎯 Use Cases

- **IBM Technical Showcase**: Enterprise AI demonstration
- **Hackathon Presentation**: Impressive visual impact
- **Investor Presentation**: Professional motorsport tech
- **Racing Simulator**: Real telemetry integration
- **Educational Tool**: F1 engineering concepts
- **Esports Platform**: Live race monitoring

## 🔧 Customization

### Changing Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  'telemetry': {
    cyan: '#00d4ff',    // Your color
    green: '#00ff88',   // Your color
    // ...
  }
}
```

### Adding New Telemetry

1. Update `lib/telemetryStore.ts` interface
2. Add display component in `components/`
3. Update simulator in `lib/useSimulator.ts`

## 📝 License

MIT License - feel free to use for any purpose

## 🙏 Credits

- **Design Inspiration**: IBM watsonx, F1 pit wall systems
- **AI Engine**: Ifrah AI v2.0
- **Telemetry Backend**: Abdul's telemetry system
- **Built with**: Next.js, React, TypeScript, TailwindCSS

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for Formula 1 enthusiasts and AI engineers**