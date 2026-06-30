import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuthStore, useUIStore } from '../lib/stores'
import {
  IconSparkles,
  IconGlobe,
  IconBolt,
  IconPlug,
  IconRobot,
  IconCpu,
  IconDeviceTv,
  IconTemperature,
  IconRadar,
  IconSettings,
  IconCircleDot,
  IconVolume2,
  IconSun,
  IconMoon,
} from '@tabler/icons-react'

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  // Simulation animation state
  const [ledOn, setLedOn] = useState(false)
  const [temp, setTemp] = useState(24.5)

  useEffect(() => {
    const interval = setInterval(() => {
      setLedOn(prev => !prev)
      setTemp(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#07070A] text-slate-100 font-sans overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#07070A]/75 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            R
          </div>
          <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            RakitIO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-xs text-blue-400 font-medium backdrop-blur-sm">
            <IconSparkles size={12} className="text-blue-400" /> AI-Native Browser Platform
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
            Build, Simulate &amp; Deploy
            <br />
            <span className="text-blue-500 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Embedded Systems
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            RakitIO is an AI-native workspace for designing circuits, compiling Arduino C++ code, and simulating hardware—entirely in your browser.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/auth?mode=register'}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
            >
              Start Building
            </Link>
            <a
              href="#architecture"
              className="px-6 py-3 border border-slate-800 hover:bg-slate-900/60 text-slate-300 rounded-lg text-sm font-semibold transition-all hover:border-slate-700"
            >
              Platform Architecture
            </a>
          </div>
        </div>

        {/* Live Interactive Simulator Showcase */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl border border-slate-800/80 bg-[#0A0A0F] p-6 shadow-2xl shadow-blue-500/5 backdrop-blur-md overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {/* Window header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 ml-2 font-mono">My ESP32 Weather Station</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-500 font-mono">Simulating</span>
              </div>
            </div>

            {/* Simulated Canvas */}
            <div className="h-60 bg-[#050508] rounded-xl border border-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
              
              {/* Simulated Circuit Drawing */}
              <svg width="260" height="200" viewBox="0 0 260 200" className="relative z-10">
                {/* ESP32 Board */}
                <rect x="90" y="30" width="80" height="130" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                <rect x="98" y="45" width="64" height="40" rx="3" fill="#0F172A" />
                <text x="130" y="68" fill="#475569" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ESP32 WROOM</text>
                
                {/* Pins */}
                {Array.from({ length: 10 }, (_, idx) => (
                  <circle key={`lp-${idx}`} cx="90" cy={40 + idx * 11} r="2" fill="#F59E0B" />
                ))}
                {Array.from({ length: 10 }, (_, idx) => (
                  <circle key={`rp-${idx}`} cx="170" cy={40 + idx * 11} r="2" fill="#F59E0B" />
                ))}

                {/* DHT22 Sensor */}
                <rect x="20" y="50" width="40" height="50" rx="3" fill="#0284C7" stroke="#0369A1" strokeWidth="1" />
                <rect x="25" y="55" width="30" height="30" rx="2" fill="#38BDF8" opacity="0.1" />
                {Array.from({ length: 4 }, (_, idx) => (
                  <line key={`dht-${idx}`} x1={28 + idx * 8} y1={55} x2={28 + idx * 8} y2={85} stroke="#38BDF8" strokeWidth="0.5" opacity="0.3" />
                ))}

                {/* LED */}
                <circle cx="210" cy="80" r="10" fill={ledOn ? '#EF4444' : '#475569'} className="transition-colors duration-200" />
                <path d="M 205 92 L 205 110" stroke="#94A3B8" strokeWidth="1" />
                <path d="M 215 92 L 215 110" stroke="#94A3B8" strokeWidth="1" />

                {/* Wires */}
                <path d="M 90 73 C 60 73, 60 75, 40 75" fill="none" stroke="#EF4444" strokeWidth="1.5" />
                <path d="M 170 128 C 190 128, 190 110, 205 110" fill="none" stroke="#22C55E" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Serial Monitor & Controls */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-[#050508] p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-green-400 space-y-1 h-24 overflow-y-auto">
                <div>[10:15:01] Starting simulation...</div>
                <div>[10:15:02] WiFi Connected: 192.168.1.104</div>
                <div>[10:15:03] Temp: {temp}°C | Hum: 62%</div>
                <div className="animate-pulse">[10:15:04] Publishing to MQTT...</div>
              </div>
              <div className="bg-[#050508] p-3 rounded-lg border border-slate-900 space-y-2 flex flex-col justify-center">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Temperature</span>
                  <span className="text-blue-400 font-bold">{temp}°C</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Platform Architecture Section */}
      <section id="architecture" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Platform Architecture
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Cloudflare-first serverless architecture. Run heavy-duty simulation directly inside the browser using web workers and decoupled buses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Frontend (Cloudflare Pages)',
              desc: 'React 19, Monaco Editor, and a custom Scene Graph rendering engine for high-performance viewport interactions.',
              icon: <IconGlobe size={28} className="text-blue-500" />,
              items: ['React 19 + TypeScript', 'Vite Bundler', 'Monaco Editor', 'Custom Scene Graph'],
            },
            {
              title: 'Simulation (Web Worker)',
              desc: 'Rakit VM executing register-based bytecode (Rakit ISA) in an isolated background thread for stutter-free UI.',
              icon: <IconBolt size={28} className="text-blue-500" />,
              items: ['Register-based VM', 'Tree-sitter C++ AST', 'Source Map Debugger', 'Simulation Timeline'],
            },
            {
              title: 'Bus & Device Runtime',
              desc: 'Modular bus architecture (GPIO, I2C, SPI, UART) connecting custom external device plugins via lifecycle hooks.',
              icon: <IconPlug size={28} className="text-blue-500" />,
              items: ['GPIO / ADC / PWM / I2C', 'Netlist Conflict Solver', 'NPM-like Device Registry', 'RFC-0003 Plugin SDK'],
            },
            {
              title: 'Database & AI Services',
              desc: 'Turso (SQLite) database and AI Planner/Generator services for real-time project generation and schematic reviews.',
              icon: <IconRobot size={28} className="text-blue-500" />,
              items: ['Turso edge DB', 'AI Planner & Generator', 'Circuit Reviewer', 'AI Context Injector'],
            },
          ].map((arch) => (
            <div
              key={arch.title}
              className="border border-slate-800/80 bg-[#0A0A0F]/80 rounded-xl p-6 hover:border-slate-700/80 transition-all hover:-translate-y-1"
            >
              <div className="mb-4">{arch.icon}</div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{arch.title}</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{arch.desc}</p>
              <ul className="space-y-1.5">
                {arch.items.map((it) => (
                  <li key={it} className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Component Library Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            2D SVG Component Library
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            High-fidelity, manufacturer-accurate vector representations. Clean layers, pins, and metadata embedded directly inside the SVGs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'ESP32 DevKit V1', cat: 'Boards', icon: <IconCpu size={24} className="text-blue-400" /> },
            { name: 'Arduino Uno R3', cat: 'Boards', icon: <IconCpu size={24} className="text-blue-400" /> },
            { name: 'Raspberry Pi Pico', cat: 'Boards', icon: <IconCpu size={24} className="text-blue-400" /> },
            { name: 'OLED SSD1306', cat: 'Displays', icon: <IconDeviceTv size={24} className="text-indigo-400" /> },
            { name: 'LCD 16x2 (I2C)', cat: 'Displays', icon: <IconDeviceTv size={24} className="text-indigo-400" /> },
            { name: 'DHT22 Sensor', cat: 'Sensors', icon: <IconTemperature size={24} className="text-emerald-400" /> },
            { name: 'BME280 Sensor', cat: 'Sensors', icon: <IconTemperature size={24} className="text-emerald-400" /> },
            { name: 'HC-SR04 Distance', cat: 'Sensors', icon: <IconRadar size={24} className="text-emerald-400" /> },
            { name: 'SG90 Micro Servo', cat: 'Actuators', icon: <IconSettings size={24} className="text-purple-400" /> },
            { name: 'Push Button', cat: 'Input', icon: <IconCircleDot size={24} className="text-amber-400" /> },
            { name: 'Potentiometer', cat: 'Input', icon: <IconCircleDot size={24} className="text-amber-400" /> },
            { name: 'Buzzer', cat: 'Actuators', icon: <IconVolume2 size={24} className="text-purple-400" /> },
          ].map((comp) => (
            <div
              key={comp.name}
              className="border border-slate-950 bg-[#08080C] hover:bg-[#0C0C12] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200 group border-slate-800/60 hover:border-blue-500/30"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                {comp.icon}
              </div>
              <div className="text-xs font-semibold text-slate-200 mb-0.5">{comp.name}</div>
              <div className="text-[10px] text-slate-500">{comp.cat}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/60 bg-gradient-to-b from-transparent to-blue-950/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            How It Works
          </h2>
          <p className="text-sm text-slate-400">
            From a natural language prompt to a simulated, working circuit in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {[
            { step: '1', title: 'Describe Project', desc: 'Type a prompt describing what you want to build (e.g. greenhouse monitor).' },
            { step: '2', title: 'AI Generates', desc: 'The AI Planner compiles the hardware manifest, connects the pins, and writes the C++.' },
            { step: '3', title: 'Simulate', desc: 'Run and debug the circuit in real-time in the browser. Inspect variables and logic lines.' },
            { step: '4', title: 'Export Code', desc: 'Download the standard Arduino C++ code (.ino) or complete ZIP package.' },
            { step: '5', title: 'Upload Hardware', desc: 'Upload the compiled binary to your physical board using the Web Serial API.' },
          ].map((item, _idx) => (
            <div key={item.title} className="relative flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                {item.step}
              </div>
              <h3 className="text-sm font-bold text-slate-200">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[180px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 text-center text-xs text-slate-600 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>RakitIO — AI-Native Embedded Development Platform</div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer">Docs</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
