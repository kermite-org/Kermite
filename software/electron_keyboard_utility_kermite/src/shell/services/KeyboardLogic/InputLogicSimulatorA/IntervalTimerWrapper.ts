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
