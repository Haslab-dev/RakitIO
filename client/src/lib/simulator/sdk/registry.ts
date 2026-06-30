import type { DevicePlugin, DeviceContext, I2CEvent, RendererContext } from './device';

// --- Virtual LED ---
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

// --- Virtual Button ---
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

// --- Device Registry ---
export class DeviceRegistry {
  public static createDevice(id: string, definitionId?: string): DevicePlugin {
    const type = (definitionId || id).toLowerCase();
    if (type.startsWith('led')) return new VirtualLED();
    if (type.startsWith('button')) return new VirtualButton();
    if (type.startsWith('potentiometer')) return new VirtualPotentiometer();
    if (type.startsWith('bme280')) return new VirtualBME280();
    if (type.startsWith('oled') || type.startsWith('ssd1306') || type.startsWith('lcd')) return new VirtualOLED();
    if (type.startsWith('servo')) return new VirtualServo();
    if (type.startsWith('dht')) return new VirtualDHT();
    
    // Fallback simple device
    return {
      onMount() {},
      onTick() {},
      onRender() {},
      onDestroy() {},
    };
  }
}
