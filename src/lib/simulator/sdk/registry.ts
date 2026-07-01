import type { DevicePlugin, DeviceContext, I2CEvent, RendererContext } from './device';

/**
 * Virtual LED Device
 *
 * Simulates a standard through-hole LED connected via a current-limiting resistor.
 * The LED turns on when the anode voltage exceeds ~1.2V and cathode is LOW (0V).
 *
 * Pins:
 * - anode: Connect to GPIO pin via 220Ω resistor
 * - cathode: Connect to GND
 *
 * Usage:
 * ```cpp
 * const int ledPin = 13;
 * void setup() {
 *   pinMode(ledPin, OUTPUT);
 * }
 * void loop() {
 *   digitalWrite(ledPin, HIGH);
 *   delay(1000);
 *   digitalWrite(ledPin, LOW);
 *   delay(1000);
 * }
 * ```
 */
export class VirtualLED implements DevicePlugin {
  private ctx!: DeviceContext;
  public on = false;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    // Read anode and cathode voltages from netlist
    const vAnode = this.ctx.readPin('anode');
    const vCathode = this.ctx.readPin('cathode');
    
    // LED turns on if anode is HIGH (or voltage > 1.5) and cathode is LOW (0)
    this.on = vAnode > 1.2 && vCathode < 0.5;
    this.ctx.emitEvent('state_change', { on: this.on });
  }

  onRender(renderer: RendererContext) {
    renderer.setStyle('.led-glow', 'opacity', this.on ? '0.6' : '0');
    renderer.setAttribute('.led-lens', 'fill', this.on ? '#ff0000' : '#880000');
  }

  onDestroy() {}
}

/**
 * Virtual Push Button
 *
 * Simulates a momentary tactile push button (like a tactile switch).
 * When pressed, it connects pin1 to pin2 allowing current flow.
 *
 * Pins:
 * - pin1: Connect to GPIO input pin
 * - pin2: Connect to GND or VCC depending on circuit
 *
 * Usage:
 * ```cpp
 * const int buttonPin = 2;
 * void setup() {
 *   pinMode(buttonPin, INPUT_PULLUP);
 * }
 * void loop() {
 *   if (digitalRead(buttonPin) == LOW) {
 *     // Button pressed
 *   }
 * }
 * ```
 */
export class VirtualButton implements DevicePlugin {
  private ctx!: DeviceContext;
  public pressed = false;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    // If pressed, we connect pin1 and pin2.
    // The NetlistSolver handles the actual connection, but we can also propagate here
    if (this.pressed) {
      const v1 = this.ctx.readPin('pin1');
      const v2 = this.ctx.readPin('pin2');
      // If one side has a driver, propagate to the other
      if (v1 !== v2) {
        this.ctx.writePin('pin1', v2);
        this.ctx.writePin('pin2', v1);
      }
    }
  }

  onRender(renderer: RendererContext) {
    renderer.setStyle('.button-cap', 'transform', this.pressed ? 'translateY(1px)' : 'translateY(0)');
  }

  onDestroy() {}
}

// --- Virtual Potentiometer ---
export class VirtualPotentiometer implements DevicePlugin {
  private ctx!: DeviceContext;
  public position = 0.5; // 0.0 to 1.0 (set via UI)

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    const vVcc = this.ctx.readPin('vcc');
    const vGnd = this.ctx.readPin('gnd');
    const vWiper = vGnd + (vVcc - vGnd) * this.position;
    
    // Write wiper voltage as an analog output
    this.ctx.writePin('wiper', vWiper);
  }

  onRender(renderer: RendererContext) {
    // Rotate the wiper dial
    const angle = -135 + this.position * 270;
    renderer.setStyle('.pot-dial', 'transform', `rotate(${angle}deg)`);
  }

  onDestroy() {}
}

// --- Virtual BME280 (I2C) ---
export class VirtualBME280 implements DevicePlugin {
  public temperature = 25.0;
  public humidity = 50.0;
  public pressure = 1013.25;
  
  private activeRegister = 0;

  onMount(_ctx: DeviceContext) {}

  onTick() {}

  onI2C(event: I2CEvent): number | void {
    if (event.type === 'write' && event.data !== undefined) {
      this.activeRegister = event.data;
    } else if (event.type === 'read') {
      // Simulate BME280 registers
      // 0xFA-0xFC: Temperature, 0xF7-0xF9: Pressure, 0xFD-0xFE: Humidity
      switch (this.activeRegister) {
        case 0xFA: // Temp MSB
          this.activeRegister++;
          return Math.floor(this.temperature) & 0xFF;
        case 0xFB: // Temp LSB
          this.activeRegister++;
          return Math.floor((this.temperature % 1) * 256) & 0xFF;
        case 0xFD: // Hum MSB
          this.activeRegister++;
          return Math.floor(this.humidity) & 0xFF;
        default:
          return 0x00;
      }
    }
  }

  onRender() {}
  onDestroy() {}
}

// --- Virtual OLED SSD1306 (I2C) ---
export class VirtualOLED implements DevicePlugin {
  private ctx!: DeviceContext;
  private buffer: string[] = [];
  public text = '';

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {}

  onI2C(event: I2CEvent): number | void {
    if (event.type === 'write' && event.data !== undefined) {
      const byte = event.data;
      // Simple character decoding for demo text printing over I2C
      if (byte >= 32 && byte <= 126) {
        this.buffer.push(String.fromCharCode(byte));
      } else if (byte === 10 || byte === 13) {
        this.buffer.push('\n');
      }
      
      // Update screen text
      const rawText = this.buffer.join('');
      // Limit to last few lines or clean it up
      this.text = rawText.split('\n').slice(-4).join('\n');
      this.ctx.emitEvent('text_change', { text: this.text });
    }
  }

  onRender(renderer: RendererContext) {
    renderer.setText('.oled-display-text', this.text || 'RakitIO SSD1306\nSystem Ready...');
  }

  onDestroy() {}
}

// --- Virtual Servo ---
export class VirtualServo implements DevicePlugin {
  private ctx!: DeviceContext;
  public angle = 90; // 0 to 180

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    const vSignal = this.ctx.readPin('signal');
    if (typeof vSignal === 'number' && vSignal >= 0) {
      this.angle = Math.round(Math.min(180, Math.max(0, vSignal)));
      this.ctx.emitEvent('state_change', { angle: this.angle });
    }
  }

  onPWM(_pinId: string, dutyCycle: number) {
    // Standard servo: 50Hz frequency.
    // 1ms pulse (5% duty cycle) = 0 degrees.
    // 1.5ms pulse (7.5% duty cycle) = 90 degrees.
    // 2ms pulse (10% duty cycle) = 180 degrees.
    const minDuty = 0.05;
    const maxDuty = 0.10;
    const clamped = Math.min(maxDuty, Math.max(minDuty, dutyCycle));
    this.angle = Math.round(((clamped - minDuty) / (maxDuty - minDuty)) * 180);
    this.ctx.emitEvent('state_change', { angle: this.angle });
  }

  onRender(renderer: RendererContext) {
    renderer.setStyle('.servo-horn', 'transform', `rotate(${this.angle - 90}deg)`);
  }

  onDestroy() {}
}

// --- Virtual DHT ---
export class VirtualDHT implements DevicePlugin {
  public temperature = 24.0;
  public humidity = 60.0;

  onMount(_ctx: DeviceContext) {}

  onTick() {}
  onRender() {}
  onDestroy() {}
}

/**
 * Virtual RGB LED (Common Cathode)
 *
 * Simulates a common cathode RGB LED with separate R, G, B pins.
 * Each color channel can be controlled independently using PWM.
 *
 * Pins:
 * - r: Red channel (PWM)
 * - g: Green channel (PWM)
 * - b: Blue channel (PWM)
 * - gnd: Common cathode (GND)
 *
 * Usage:
 * ```cpp
 * void setup() {
 *   pinMode(9, OUTPUT);  // Red
 *   pinMode(10, OUTPUT); // Green
 *   pinMode(11, OUTPUT); // Blue
 * }
 * void loop() {
 *   analogWrite(9, 255);  // Full red
 *   analogWrite(10, 0);
 *   analogWrite(11, 0);
 *   delay(1000);
 * }
 * ```
 */
export class VirtualRGBLED implements DevicePlugin {
  private ctx!: DeviceContext;
  public r = 0;
  public g = 0;
  public b = 0;
  public on = false;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    const vR = this.ctx.readPin('r');
    const vG = this.ctx.readPin('g');
    const vB = this.ctx.readPin('b');
    this.r = Math.round((vR / 5.0) * 255);
    this.g = Math.round((vG / 5.0) * 255);
    this.b = Math.round((vB / 5.0) * 255);
    this.on = this.r > 0 || this.g > 0 || this.b > 0;
    this.ctx.emitEvent('state_change', { r: this.r, g: this.g, b: this.b, on: this.on });
  }

  onRender(renderer: RendererContext) {
    const color = `rgb(${this.r}, ${this.g}, ${this.b})`;
    renderer.setAttribute('.rgb-led-lens', 'fill', color);
    renderer.setStyle('.rgb-led-glow', 'opacity', this.on ? '0.4' : '0');
  }

  onDestroy() {}
}

// --- Virtual Relay ---
export class VirtualRelay implements DevicePlugin {
  private ctx!: DeviceContext;
  public active = false;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    const signal = this.ctx.readPin('in');
    this.active = signal > 1.5;
    this.ctx.emitEvent('state_change', { active: this.active });
  }

  onRender(renderer: RendererContext) {
    renderer.setStyle('.relay-arm', 'transform', this.active ? 'translateY(-2px)' : 'translateY(0)');
  }

  onDestroy() {}
}

/**
 * Virtual Piezo Buzzer
 *
 * Simulates a passive piezo buzzer that can generate tones at different frequencies.
 * Uses tone() and noTone() functions for control.
 *
 * Pins:
 * - positive: Signal pin (PWM)
 * - negative: GND
 *
 * Usage:
 * ```cpp
 * const int buzzerPin = 8;
 * void setup() {
 *   pinMode(buzzerPin, OUTPUT);
 * }
 * void loop() {
 *   tone(buzzerPin, 1000); // 1kHz tone
 *   delay(500);
 *   noTone(buzzerPin);
 *   delay(500);
 * }
 * ```
 */
export class VirtualBuzzer implements DevicePlugin {
  private ctx!: DeviceContext;
  public frequency = 0;
  public active = false;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onPWM(_pinId: string, dutyCycle: number) {
    this.frequency = 440 + dutyCycle * 1000;
    this.active = dutyCycle > 0.1;
    this.ctx.emitEvent('state_change', { frequency: this.frequency, active: this.active });
  }

  onTick() {
    const signal = this.ctx.readPin('positive');
    this.active = signal > 1.5;
    this.ctx.emitEvent('state_change', { frequency: this.frequency, active: this.active });
  }

  onRender(renderer: RendererContext) {
    const opacity = this.active ? '0.6' : '0';
    renderer.setStyle('.buzzer-wave-1', 'opacity', opacity);
    renderer.setStyle('.buzzer-wave-2', 'opacity', String(Number(opacity) * 0.5));
  }

  onDestroy() {}
}

/**
 * Virtual HC-SR04 Ultrasonic Distance Sensor
 *
 * Measures distance using ultrasonic sound waves.
 * Works with pulseIn() to measure echo pulse width.
 *
 * Pins:
 * - vcc: 5V power
 * - trig: Trigger pin (OUTPUT)
 * - echo: Echo pin (INPUT)
 * - gnd: Ground
 *
 * Usage:
 * ```cpp
 * const int trigPin = 9;
 * const int echoPin = 10;
 * long duration, distance;
 *
 * void setup() {
 *   pinMode(trigPin, OUTPUT);
 *   pinMode(echoPin, INPUT);
 *   Serial.begin(9600);
 * }
 * void loop() {
 *   digitalWrite(trigPin, LOW);
 *   delayMicroseconds(2);
 *   digitalWrite(trigPin, HIGH);
 *   delayMicroseconds(10);
 *   digitalWrite(trigPin, LOW);
 *
 *   duration = pulseIn(echoPin, HIGH);
 *   distance = (duration / 2) / 29.1;
 *   Serial.println(distance);
 *   delay(500);
 * }
 * ```
 */
export class VirtualHCSR04 implements DevicePlugin {
  private ctx!: DeviceContext;
  public distance = 0;
  public lastTrigTime = 0;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    const trig = this.ctx.readPin('trig');
    if (trig > 2.5) {
      this.lastTrigTime = Date.now();
    }
    const echo = this.ctx.readPin('echo');
    if (this.lastTrigTime > 0 && echo > 2.5) {
      const elapsed = Date.now() - this.lastTrigTime;
      this.distance = elapsed * 0.034 / 2;
      this.distance = Math.min(this.distance, 400);
    }
    this.ctx.emitEvent('distance_change', { distance: this.distance });
  }

  onRender(renderer: RendererContext) {
    renderer.setText('.hcsr04-distance', `${this.distance.toFixed(1)} cm`);
  }

  onDestroy() {}
}

/**
 * Virtual Light Dependent Resistor (LDR / Photoresistor)
 *
 * Simulates an LDR sensor whose resistance changes with light intensity.
 * Outputs an analog voltage that varies with brightness.
 *
 * Pins:
 * - vcc: 5V power
 * - out: Analog output voltage (0-5V)
 * - gnd: Ground
 *
 * Usage:
 * ```cpp
 * const int ldrPin = A0;
 * void setup() {
 *   Serial.begin(9600);
 * }
 * void loop() {
 *   int value = analogRead(ldrPin);
 *   Serial.println(value);
 *   delay(100);
 * }
 * ```
 */
export class VirtualLDR implements DevicePlugin {
  private ctx!: DeviceContext;
  public resistance = 500;
  public brightness = 0.5;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    const vVcc = this.ctx.readPin('vcc');
    const vGnd = this.ctx.readPin('gnd');
    const voltage = vGnd + (vVcc - vGnd) * this.brightness;
    this.ctx.writePin('out', voltage);
    this.ctx.emitEvent('state_change', { resistance: this.resistance, brightness: this.brightness });
  }

  onRender(renderer: RendererContext) {
    const isBright = this.brightness > 0.5;
    renderer.setAttribute('.ldr-indicator', 'fill', isBright ? '#FDE047' : '#52525B');
  }

  onDestroy() {}
}

/**
 * Virtual PIR Motion Sensor (HC-SR501)
 *
 * Simulates a Passive Infrared motion detector.
 * Outputs HIGH when motion is detected, LOW when idle.
 *
 * Pins:
 * - vcc: 5V power
 * - out: Digital output (HIGH when motion detected)
 * - gnd: Ground
 *
 * Usage:
 * ```cpp
 * const int pirPin = 2;
 * void setup() {
 *   pinMode(pirPin, INPUT);
 *   Serial.begin(9600);
 * }
 * void loop() {
 *   if (digitalRead(pirPin) == HIGH) {
 *     Serial.println("Motion detected!");
 *   }
 *   delay(100);
 * }
 * ```
 */
export class VirtualPIR implements DevicePlugin {
  private ctx!: DeviceContext;
  public motion = false;

  onMount(ctx: DeviceContext) {
    this.ctx = ctx;
  }

  onTick() {
    const signal = this.ctx.readPin('out');
    this.motion = signal > 1.5;
    this.ctx.emitEvent('motion_detected', { motion: this.motion });
  }

  onRender(renderer: RendererContext) {
    renderer.setStyle('.pir-sensor', 'fill', this.motion ? '#22C55E' : '#334155');
    renderer.setStyle('.pir-led', 'fill', this.motion ? '#22C55E' : '#4B5563');
  }

  onDestroy() {}
}

// --- Device Registry ---
export class DeviceRegistry {
  public static createDevice(id: string, definitionId?: string): DevicePlugin {
    const type = (definitionId || id).toLowerCase();
    if (type.startsWith('led') && !type.includes('rgb')) return new VirtualLED();
    if (type.startsWith('button')) return new VirtualButton();
    if (type.startsWith('potentiometer')) return new VirtualPotentiometer();
    if (type.startsWith('bme280')) return new VirtualBME280();
    if (type.startsWith('oled') || type.startsWith('ssd1306') || type.startsWith('lcd')) return new VirtualOLED();
    if (type.startsWith('servo')) return new VirtualServo();
    if (type.startsWith('dht')) return new VirtualDHT();
    if (type.startsWith('rgb')) return new VirtualRGBLED();
    if (type.startsWith('relay')) return new VirtualRelay();
    if (type.startsWith('buzzer')) return new VirtualBuzzer();
    if (type.startsWith('hcsr04') || type.startsWith('ultrasonic')) return new VirtualHCSR04();
    if (type.startsWith('ldr') || type.startsWith('light')) return new VirtualLDR();
    if (type.startsWith('pir') || type.startsWith('motion')) return new VirtualPIR();
    
    // Fallback simple device
    return {
      onMount() {},
      onTick() {},
      onRender() {},
      onDestroy() {},
    };
  }
}
