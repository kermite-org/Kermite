export function debounce<T extends any[]>(
  targetProc: (...args: T) => void,
  ms: number,
) {
  let timerId: any;
  return (...args: T) => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = 0;
    }
    timerId = setTimeout(() => targetProc(...args), ms);
  };
}

export class IntervalTimerWrapper {
  private timerHandle: number | undefined;
  start(proc: () => void, ms: number) {
    this.timerHandle = setInterval(proc, ms) as any;
  }

  stop() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }
}
