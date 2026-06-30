import { Link } from 'react-router'
import { useAuthStore } from '../lib/stores'

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white font-bold text-sm">R</div>
          <span className="text-lg font-semibold text-text-primary">RakitIO</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-4 py-2 text-text-secondary hover:text-text-primary text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white font-bold text-2xl mx-auto mb-8">
            R
          </div>

          <h1 className="text-5xl font-bold text-text-primary mb-6 leading-tight">
            Build, Simulate &amp; Deploy
            <br />
            <span className="text-accent">Embedded Systems</span>
          </h1>

          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            AI-native browser platform for Arduino, ESP32, and RP2040 development.
            Design circuits, write code, simulate hardware — all in your browser.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              to={isAuthenticated ? '/dashboard' : '/auth?mode=register'}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Building
            </Link>
            <a
              href="#features"
              className="px-6 py-3 border border-border hover:bg-bg-hover text-text-secondary hover:text-text-primary rounded-lg text-sm font-medium transition-colors"
            >
              Learn More
            </a>
          </div>

          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Visual Circuit Editor',
                desc: 'Drag & drop components, auto-route wires, real-time pin validation. SVG-based rendering with zoom and pan.',
                icon: '⚡',
              },
              {
                title: 'AI-Powered Development',
                desc: 'Describe your project in natural language. AI generates wiring, code, and documentation automatically.',
                icon: '🤖',
              },
              {
                title: 'Real-Time Simulation',
                desc: 'Simulate GPIO, ADC, PWM, UART, I2C, SPI directly in the browser. No Docker, no server-side execution.',
                icon: '🔬',
              },
              {
                title: 'Arduino Compatible',
                desc: 'Generated code compiles in Arduino IDE. Supports Uno, Nano, Mega, ESP32, ESP8266, and Pico.',
                icon: '🔌',
              },
              {
                title: '18+ Components',
                desc: 'LEDs, sensors, displays, actuators, communication modules. Extensible module SDK for custom components.',
                icon: '📦',
              },
              {
                title: 'Export & Deploy',
                desc: 'Export as .ino, Arduino ZIP, SVG wiring diagrams, or JSON project files.',
                icon: '🚀',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border border-border rounded-lg bg-bg-secondary p-5 hover:bg-bg-hover transition-colors"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{f.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-text-secondary">
        RakitIO — AI-Native Embedded Development Platform
      </footer>
    </div>
  )
}
