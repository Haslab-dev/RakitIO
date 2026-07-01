import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useAuthStore, useUIStore } from '../lib/stores'
import {
  IconSparkles,
  IconGlobe,
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
  IconArrowRight,
  IconShieldCheck,
  IconBolt,
  IconCode,
} from '@tabler/icons-react'

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  const [ledOn, setLedOn] = useState(false)
  const [temp, setTemp] = useState(24.5)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setLedOn(prev => !prev)
      setTemp(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans overflow-x-hidden selection:bg-violet-500/30 selection:text-zinc-200">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute top-[30%] right-0 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/25">
            R
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400">Rakit</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">IO</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-all duration-200 flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/30 hover:-translate-y-0.5 flex items-center gap-2"
            >
              Dashboard <IconArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/30 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Get Started <IconArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-sm text-violet-400 font-medium backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <IconSparkles size={14} className="text-violet-400" /> AI-Native Browser Platform
          </div>
          <h1 className={`text-5xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.1] transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400">
              Build, Simulate &amp; Deploy
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400">
              Embedded Systems
            </span>
          </h1>
          <p className={`text-lg text-zinc-400 max-w-xl leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            RakitIO is an AI-native workspace for designing circuits, compiling Arduino C++ code, and simulating hardware—entirely in your browser.
          </p>
          <div className={`flex flex-wrap items-center gap-4 pt-2 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              to={isAuthenticated ? '/dashboard' : '/auth?mode=register'}
              className="group px-7 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-xl shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start Building
              <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#architecture"
              className="px-7 py-3.5 border border-zinc-700/80 hover:bg-zinc-800/60 hover:border-zinc-600 text-zinc-300 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            >
              Platform Architecture
            </a>
          </div>

          <div className={`flex items-center gap-8 pt-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2">
              <IconShieldCheck size={18} className="text-emerald-400" />
              <span className="text-sm text-zinc-500">No install required</span>
            </div>
            <div className="flex items-center gap-2">
              <IconBolt size={18} className="text-amber-400" />
              <span className="text-sm text-zinc-500">Real-time simulation</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCode size={18} className="text-blue-400" />
              <span className="text-sm text-zinc-500">Export Arduino code</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-md overflow-hidden group hover:border-zinc-700/80 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-zinc-500 ml-3 font-mono">My ESP32 Weather Station</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-mono">Simulating</span>
              </div>
            </div>

            <div className="h-64 bg-[#08080B] rounded-xl border border-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:18px_18px] opacity-40" />

              <svg width="280" height="210" viewBox="0 0 280 210" className="relative z-10">
                <rect x="100" y="25" width="80" height="150" rx="8" fill="#18181B" stroke="#27272A" strokeWidth="2" />
                <rect x="110" y="40" width="60" height="45" rx="4" fill="#09090B" />
                <text x="140" y="67" fill="#52525B" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ESP32 WROOM</text>

                {Array.from({ length: 10 }, (_, idx) => (
                  <circle key={`lp-${idx}`} cx="100" cy={35 + idx * 13} r="2.5" fill="#CA8A04" />
                ))}
                {Array.from({ length: 10 }, (_, idx) => (
                  <circle key={`rp-${idx}`} cx="180" cy={35 + idx * 13} r="2.5" fill="#CA8A04" />
                ))}

                <rect x="15" y="50" width="50" height="60" rx="4" fill="#0C4A6E" stroke="#0369A1" strokeWidth="1.5" />
                <rect x="22" y="58" width="36" height="36" rx="3" fill="#38BDF8" opacity="0.15" />
                {Array.from({ length: 4 }, (_, idx) => (
                  <line key={`dht-${idx}`} x1={28 + idx * 9} y1={58} x2={28 + idx * 9} y2={94} stroke="#38BDF8" strokeWidth="0.6" opacity="0.4" />
                ))}

                <circle cx="230" cy="85" r="12" fill={ledOn ? '#EF4444' : '#52525B'} className="transition-colors duration-150 drop-shadow-lg" />
                <circle cx="230" cy="85" r="16" fill={ledOn ? '#EF4444' : 'transparent'} className="opacity-20 transition-colors duration-150" />
                <path d="M 224 100 L 224 120" stroke="#A1A1AA" strokeWidth="1.5" />
                <path d="M 236 100 L 236 120" stroke="#A1A1AA" strokeWidth="1.5" />

                <path d="M 100 82 C 65 82, 65 80, 45 80" fill="none" stroke="#EF4444" strokeWidth="2" />
                <path d="M 180 145 C 205 145, 205 120, 224 120" fill="none" stroke="#22C55E" strokeWidth="2" />
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-[#08080B] p-3 rounded-lg border border-zinc-900 font-mono text-[10px] text-emerald-400 space-y-1.5 h-28 overflow-y-auto">
                <div>[10:15:01] Starting simulation...</div>
                <div>[10:15:02] WiFi Connected: 192.168.1.104</div>
                <div>[10:15:03] Temp: {temp}°C | Hum: 62%</div>
                <div className="animate-pulse">[10:15:04] Publishing to MQTT...</div>
              </div>
              <div className="bg-[#08080B] p-3 rounded-lg border border-zinc-900 space-y-3 flex flex-col justify-center">
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Temperature</span>
                  <span className="text-violet-400 font-bold">{temp}°C</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-1.5 rounded-full transition-all duration-200" style={{ width: `${(temp / 50) * 100}%` }} />
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="architecture" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-800/50">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Platform Architecture</span>
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">
            Cloudflare-first serverless architecture. Run heavy-duty simulation directly inside the browser using web workers and decoupled buses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Frontend',
              subtitle: 'Cloudflare Pages',
              desc: 'React 19, Monaco Editor, and a custom Scene Graph rendering engine for high-performance viewport interactions.',
              icon: <IconGlobe size={26} className="text-violet-400" />,
              items: ['React 19 + TypeScript', 'Vite Bundler', 'Monaco Editor', 'Custom Scene Graph'],
            },
            {
              title: 'Simulation',
              subtitle: 'Web Worker',
              desc: 'Rakit VM executing register-based bytecode (Rakit ISA) in an isolated background thread for stutter-free UI.',
              icon: <IconBolt size={26} className="text-violet-400" />,
              items: ['Register-based VM', 'Tree-sitter C++ AST', 'Source Map Debugger', 'Simulation Timeline'],
            },
            {
              title: 'Bus & Device',
              subtitle: 'Runtime',
              desc: 'Modular bus architecture (GPIO, I2C, SPI, UART) connecting custom external device plugins via lifecycle hooks.',
              icon: <IconPlug size={26} className="text-violet-400" />,
              items: ['GPIO / ADC / PWM / I2C', 'Netlist Conflict Solver', 'NPM-like Device Registry', 'RFC-0003 Plugin SDK'],
            },
            {
              title: 'Database & AI',
              subtitle: 'Services',
              desc: 'Turso (SQLite) database and AI Planner/Generator services for real-time project generation and schematic reviews.',
              icon: <IconRobot size={26} className="text-violet-400" />,
              items: ['Turso edge DB', 'AI Planner & Generator', 'Circuit Reviewer', 'AI Context Injector'],
            },
          ].map((arch, idx) => (
            <div
              key={arch.title}
              className="group relative border border-zinc-800/60 bg-zinc-900/40 rounded-2xl p-7 hover:border-violet-500/30 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-5 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-violet-500/20 flex items-center justify-center">{arch.icon}</div>
              <h3 className="text-base font-bold text-zinc-100 mb-0.5">{arch.title}</h3>
              <p className="text-xs text-violet-400 mb-4">{arch.subtitle}</p>
              <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{arch.desc}</p>
              <ul className="space-y-2">
                {arch.items.map((it) => (
                  <li key={it} className="text-[12px] text-zinc-500 flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-800/50">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">2D SVG Component Library</span>
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed">
            High-fidelity, manufacturer-accurate vector representations. Clean layers, pins, and metadata embedded directly inside the SVGs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'ESP32 DevKit V1', cat: 'Boards', icon: <IconCpu size={22} className="text-violet-400" /> },
            { name: 'Arduino Uno R3', cat: 'Boards', icon: <IconCpu size={22} className="text-violet-400" /> },
            { name: 'Raspberry Pi Pico', cat: 'Boards', icon: <IconCpu size={22} className="text-violet-400" /> },
            { name: 'OLED SSD1306', cat: 'Displays', icon: <IconDeviceTv size={22} className="text-blue-400" /> },
            { name: 'LCD 16x2 (I2C)', cat: 'Displays', icon: <IconDeviceTv size={22} className="text-blue-400" /> },
            { name: 'DHT22 Sensor', cat: 'Sensors', icon: <IconTemperature size={22} className="text-emerald-400" /> },
            { name: 'BME280 Sensor', cat: 'Sensors', icon: <IconTemperature size={22} className="text-emerald-400" /> },
            { name: 'HC-SR04 Distance', cat: 'Sensors', icon: <IconRadar size={22} className="text-emerald-400" /> },
            { name: 'SG90 Micro Servo', cat: 'Actuators', icon: <IconSettings size={22} className="text-amber-400" /> },
            { name: 'Push Button', cat: 'Input', icon: <IconCircleDot size={22} className="text-amber-400" /> },
            { name: 'Potentiometer', cat: 'Input', icon: <IconCircleDot size={22} className="text-amber-400" /> },
            { name: 'Buzzer', cat: 'Actuators', icon: <IconVolume2 size={22} className="text-amber-400" /> },
          ].map((comp) => (
            <div
              key={comp.name}
              className="group border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-violet-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-zinc-800 transition-all duration-300">
                {comp.icon}
              </div>
              <div className="text-xs font-semibold text-zinc-200 mb-0.5">{comp.name}</div>
              <div className="text-[10px] text-zinc-600">{comp.cat}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-800/50 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">How It Works</span>
          </h2>
          <p className="text-base text-zinc-400">
            From a natural language prompt to a simulated, working circuit in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
          {[
            { step: '1', title: 'Describe Project', desc: 'Type a prompt describing what you want to build (e.g. greenhouse monitor).' },
            { step: '2', title: 'AI Generates', desc: 'The AI Planner compiles the hardware manifest, connects the pins, and writes the C++.' },
            { step: '3', title: 'Simulate', desc: 'Run and debug the circuit in real-time in the browser. Inspect variables and logic lines.' },
            { step: '4', title: 'Export Code', desc: 'Download the standard Arduino C++ code (.ino) or complete ZIP package.' },
            { step: '5', title: 'Upload Hardware', desc: 'Upload the compiled binary to your physical board using the Web Serial API.' },
          ].map((item, idx) => (
            <div key={item.title} className="relative flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
                {item.step}
              </div>
              <h3 className="text-sm font-bold text-zinc-100">{item.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-[160px]">{item.desc}</p>
              {idx < 4 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-800/50 py-12 text-center bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <span className="text-sm text-zinc-500">RakitIO — AI-Native Embedded Development Platform</span>
          </div>
          <div className="flex gap-6">
            <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Terms</span>
            <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Privacy</span>
            <span className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors">Docs</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
