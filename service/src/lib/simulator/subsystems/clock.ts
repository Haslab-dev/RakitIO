export interface ClockSubsystem {
  getTime(): number;
  getMillis(): number;
  getMicros(): number;
  advance(us: number): void;
  reset(): void;
}

export function createClock(): ClockSubsystem {
  let microseconds = 0;

  return {
    getTime(): number {
      return microseconds;
    },

    getMillis(): number {
      return Math.floor(microseconds / 1000);
    },

    getMicros(): number {
      return microseconds;
    },

    advance(us: number): void {
      if (us < 0) {
        throw new Error('Cannot advance clock by negative value');
      }
      microseconds += us;
    },

    reset(): void {
      microseconds = 0;
    },
  };
}
