import { createGPIO, type GPIOSubsystem } from './gpio';
import { createADC, type ADCSubsystem } from './adc';
import { createPWM, type PWMSubsystem } from './pwm';
import { createUART, type UARTSubsystem } from './uart';
import { createI2C, type I2CSubsystem } from './i2c';
import { createSPI, type SPISubsystem } from './spi';
import { createClock, type ClockSubsystem } from './clock';
import { createScheduler, type Scheduler } from './scheduler';

export type { GPIOSubsystem } from './gpio';
export type { ADCSubsystem } from './adc';
export type { PWMSubsystem } from './pwm';
export type { UARTSubsystem } from './uart';
export type { I2CSubsystem, I2CDevice } from './i2c';
export type { SPISubsystem, SPIDevice } from './spi';
export type { ClockSubsystem } from './clock';
export type { Scheduler, Task } from './scheduler';

export {
  createGPIO,
  createADC,
  createPWM,
  createUART,
  createI2C,
  createSPI,
  createClock,
  createScheduler,
};

export interface SimulationSubsystems {
  gpio: GPIOSubsystem;
  adc: ADCSubsystem;
  pwm: PWMSubsystem;
  uart: UARTSubsystem;
  i2c: I2CSubsystem;
  spi: SPISubsystem;
  clock: ClockSubsystem;
  scheduler: Scheduler;
}

export function createSubsystems(): SimulationSubsystems {
  return {
    gpio: createGPIO(),
    adc: createADC(),
    pwm: createPWM(),
    uart: createUART(),
    i2c: createI2C(),
    spi: createSPI(),
    clock: createClock(),
    scheduler: createScheduler(),
  };
}
