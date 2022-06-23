export function debounce<T extends any[]>(
  targetProc: (...args: T) => void,
  ms: number,
) {
  let timerId: NodeJS.Timeout | undefined;
  return (...args: T) => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    timerId = setTimeout(() => targetProc(...args), ms);
  };
}

export function throttle<T extends (...args: any[]) => unknown>(
  callback: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let lastTime = Date.now();
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    if (currentTime - lastTime > ms) {
      callback(args);
      lastTime = currentTime;
    }
  };
}

export function debounceThrottle<T extends (...args: any[]) => unknown>(
  callback: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let task: (() => void) | undefined;
  let waiting: boolean = false;
  return (...args: Parameters<T>) => {
    if (waiting) {
      task = () => callback(args);
    } else {
      callback(args);
      waiting = true;
      setTimeout(() => {
        if (task) {
          task();
          task = undefined;
        }
        waiting = false;
      }, ms);
    }
  };
}

export class IntervalTimerWrapper {
  private timerHandle: number | undefined;
  start(callback: () => void, ms: number, callInitial?: boolean) {
    if (callInitial) {
      callback();
    }
    this.timerHandle = setInterval(callback, ms) as any;
  }

  stop() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }
}
