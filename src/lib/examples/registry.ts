export interface ExampleProject {
  id: string
  name: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  icon: string
  tags: string[]
  file: string
  wiring: string
  difficultyStars: number
}

export const EXAMPLE_PROJECTS: ExampleProject[] = [
  {
    id: 'led-blink',
    name: 'LED Blink',
    description: 'The classic first Arduino project. Blink an LED on and off.',
    difficulty: 'Beginner',
    icon: '💡',
    tags: ['LED', 'digitalWrite', 'delay'],
    difficultyStars: 1,
    file: '/examples/led-blink/sketch.ino',
    wiring: '/examples/led-blink/wiring.json',
  },
  {
    id: 'pwm-fade',
    name: 'PWM Fade',
    description: 'Fade an LED in and out using Pulse Width Modulation.',
    difficulty: 'Beginner',
    icon: '✨',
    tags: ['LED', 'PWM', 'analogWrite'],
    difficultyStars: 1,
    file: '/examples/pwm-fade/sketch.ino',
    wiring: '/examples/pwm-fade/wiring.json',
  },
  {
    id: 'button-counter',
    name: 'Button Counter',
    description: 'Count button presses and display on Serial.',
    difficulty: 'Beginner',
    icon: '🔘',
    tags: ['Button', 'digitalRead', 'INPUT_PULLUP'],
    difficultyStars: 2,
    file: '/examples/button-counter/sketch.ino',
    wiring: '/examples/button-counter/wiring.json',
  },
  {
    id: 'servo-sweep',
    name: 'Servo Sweep',
    description: 'Sweep a servo motor from 0 to 180 degrees.',
    difficulty: 'Intermediate',
    icon: '⚙️',
    tags: ['Servo', 'PWM', 'loops'],
    difficultyStars: 2,
    file: '/examples/servo-sweep/sketch.ino',
    wiring: '/examples/servo-sweep/wiring.json',
  },
  {
    id: 'temperature-monitor',
    name: 'Temperature Monitor',
    description: 'Read temperature and humidity from DHT sensor.',
    difficulty: 'Intermediate',
    icon: '🌡️',
    tags: ['DHT', 'Sensor', 'Serial'],
    difficultyStars: 2,
    file: '/examples/temperature-monitor/sketch.ino',
    wiring: '/examples/temperature-monitor/wiring.json',
  },
  {
    id: 'distance-sensor',
    name: 'Distance Sensor',
    description: 'Measure distance with ultrasonic sensor and color-coded LEDs.',
    difficulty: 'Intermediate',
    icon: '📡',
    tags: ['HC-SR04', 'pulseIn', 'sensor'],
    difficultyStars: 2,
    file: '/examples/distance-sensor/sketch.ino',
    wiring: '/examples/distance-sensor/wiring.json',
  },
  {
    id: 'tone-melody',
    name: 'Buzzer Melody',
    description: 'Play a melody using the tone() function.',
    difficulty: 'Intermediate',
    icon: '🔔',
    tags: ['Buzzer', 'tone', 'arrays'],
    difficultyStars: 2,
    file: '/examples/tone-melody/sketch.ino',
    wiring: '/examples/tone-melody/wiring.json',
  },
  {
    id: 'oled-display',
    name: 'OLED Display',
    description: 'Display text on I2C OLED screen.',
    difficulty: 'Advanced',
    icon: '🖥️',
    tags: ['OLED', 'I2C', 'Wire'],
    difficultyStars: 3,
    file: '/examples/oled-display/sketch.ino',
    wiring: '/examples/oled-display/wiring.json',
  },
  {
    id: 'mood-light',
    name: 'Mood Light',
    description: 'RGB LED color wheel controlled by potentiometer.',
    difficulty: 'Advanced',
    icon: '🌈',
    tags: ['RGB LED', 'Potentiometer', 'PWM'],
    difficultyStars: 3,
    file: '/examples/mood-light/sketch.ino',
    wiring: '/examples/mood-light/wiring.json',
  },
  {
    id: 'interrupt-counter',
    name: 'Interrupt Counter',
    description: 'Count pulses using hardware interrupts.',
    difficulty: 'Advanced',
    icon: '⚡',
    tags: ['Interrupt', 'volatile', 'ISR'],
    difficultyStars: 3,
    file: '/examples/interrupt-counter/sketch.ino',
    wiring: '/examples/interrupt-counter/wiring.json',
  },
  {
    id: 'smart-garden',
    name: 'Smart Garden',
    description: 'Automated plant monitoring with multiple sensors.',
    difficulty: 'Advanced',
    icon: '🌱',
    tags: ['Multi-sensor', 'Relay', 'automation'],
    difficultyStars: 4,
    file: '/examples/smart-garden/sketch.ino',
    wiring: '/examples/smart-garden/wiring.json',
  },
]

export function getDifficultyLabel(stars: number): string {
  return '⭐'.repeat(stars)
}
