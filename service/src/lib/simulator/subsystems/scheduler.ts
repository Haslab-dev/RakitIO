export interface Task {
  id: string;
  name: string;
  fn: () => void;
  interval: number;
  enabled: boolean;
}

export interface Scheduler {
  addTask(task: Task): void;
  removeTask(id: string): void;
  tick(): number;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  getState(): 'idle' | 'running' | 'paused';
}

interface TaskEntry {
  task: Task;
  lastRun: number;
}

export function createScheduler(): Scheduler {
  const tasks = new Map<string, TaskEntry>();
  let state: 'idle' | 'running' | 'paused' = 'idle';
  let currentTime = 0;

  return {
    addTask(task: Task): void {
      if (tasks.has(task.id)) {
        throw new Error(`Task with id "${task.id}" already exists`);
      }
      tasks.set(task.id, {
        task: { ...task },
        lastRun: 0,
      });
    },

    removeTask(id: string): void {
      tasks.delete(id);
    },

    tick(): number {
      if (state !== 'running') return 0;

      let cyclesExecuted = 0;

      for (const [id, entry] of tasks) {
        if (!entry.task.enabled) continue;

        const elapsed = currentTime - entry.lastRun;
        if (elapsed >= entry.task.interval) {
          try {
            entry.task.fn();
          } catch {
            // swallow task errors to keep scheduler running
          }
          entry.lastRun = currentTime;
          cyclesExecuted++;
        }
      }

      currentTime++;
      return cyclesExecuted;
    },

    start(): void {
      state = 'running';
      currentTime = 0;
      for (const entry of tasks.values()) {
        entry.lastRun = 0;
      }
    },

    pause(): void {
      if (state === 'running') {
        state = 'paused';
      }
    },

    resume(): void {
      if (state === 'paused') {
        state = 'running';
      }
    },

    reset(): void {
      tasks.clear();
      state = 'idle';
      currentTime = 0;
    },

    getState(): 'idle' | 'running' | 'paused' {
      return state;
    },
  };
}
