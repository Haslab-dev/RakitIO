# RakitIO Example Projects

A collection of Arduino projects ranging from beginner to advanced, ready to simulate in RakitIO.

## Beginner Projects

### 1. LED Blink (`temp-blink/`)
The classic first Arduino project. Blink an LED on and off.
- **Components:** LED
- **Pins:** D13
- **Concepts:** digitalWrite(), delay()

### 2. PWM Fade (`pwm-fade/`)
Fade an LED in and out using Pulse Width Modulation.
- **Components:** LED
- **Pins:** D9 (PWM)
- **Concepts:** analogWrite(), PWM

### 3. Button Counter (`button-counter/`)
Count button presses and display on Serial.
- **Components:** Button, LED
- **Pins:** D2 (input), D13 (LED)
- **Concepts:** digitalRead(), INPUT_PULLUP, state detection

## Intermediate Projects

### 4. Servo Sweep (`servo-sweep/`)
Sweep a servo motor from 0 to 180 degrees.
- **Components:** Servo
- **Pins:** D9 (PWM)
- **Concepts:** Servo library, for loops

### 5. Temperature Monitor (`temperature-monitor/`)
Read temperature and humidity from DHT sensor.
- **Components:** DHT11
- **Pins:** D2 (data)
- **Concepts:** dht library, Serial printing

### 6. Distance Sensor (`distance-sensor/`)
Measure distance with ultrasonic sensor and color-coded LEDs.
- **Components:** HC-SR04
- **Pins:** D9 (trig), D10 (echo)
- **Concepts:** pulseIn(), serial output

### 7. Buzzer Melody (`tone-melody/`)
Play a melody using the tone() function.
- **Components:** Buzzer
- **Pins:** D8
- **Concepts:** tone(), noTone(), arrays

### 8. OLED Display (`oled-display/`)
Display text on I2C OLED screen.
- **Components:** OLED SSD1306
- **Pins:** A4 (SDA), A5 (SCL)
- **Concepts:** I2C, Wire library

## Advanced Projects

### 9. Interrupt Counter (`interrupt-counter/`)
Count pulses using hardware interrupts.
- **Components:** Button, LED
- **Pins:** D2 (interrupt), D13 (LED)
- **Concepts:** attachInterrupt(), volatile variables

### 10. Mood Light (`mood-light/`)
RGB LED color wheel controlled by potentiometer.
- **Components:** RGB LED, Potentiometer
- **Pins:** D9, D10, D11 (PWM), A0 (analog)
- **Concepts:** map(), color theory, analog input

### 11. Smart Garden (`smart-garden/`)
Automated plant monitoring with multiple sensors.
- **Components:** Potentiometer, LED, HC-SR04, Relay
- **Pins:** A0, A1, D7, D9, D10
- **Concepts:** Multi-sensor integration, relay control, conditional logic

## How to Use

1. Open RakitIO in your browser
2. Create a new project or select an existing one
3. Copy the code from `sketch.ino` into the code editor
4. Drag the components from the library onto the canvas
5. Wire them according to `wiring.json` or the pin mappings shown
6. Click "Start Simulation" to run

## Difficulty Rating

| Project | Difficulty | Time to Build |
|---------|------------|---------------|
| LED Blink | ⭐ | 5 min |
| PWM Fade | ⭐ | 5 min |
| Button Counter | ⭐⭐ | 10 min |
| Servo Sweep | ⭐⭐ | 15 min |
| Temperature Monitor | ⭐⭐ | 15 min |
| Distance Sensor | ⭐⭐ | 20 min |
| Buzzer Melody | ⭐⭐ | 15 min |
| OLED Display | ⭐⭐⭐ | 20 min |
| Interrupt Counter | ⭐⭐⭐ | 20 min |
| Mood Light | ⭐⭐⭐ | 25 min |
| Smart Garden | ⭐⭐⭐⭐ | 30 min |

## Learning Objectives

- **Beginner:** Understand digital I/O, PWM, and basic control flow
- **Intermediate:** Work with libraries, sensors, and communication protocols
- **Advanced:** Implement interrupts, multi-sensor systems, and state machines
