export class EventBus<T> {
  private handlers: Map<keyof T, Function[]> = new Map();

  emit<K extends keyof T>(op: K, arg: T[K]) {
    const procs = this.handlers.get(op);
    if (procs) {
      for (const proc of procs) {
        proc(arg);
      }
    }
  }

  on<K extends keyof T>(op: K, proc: (arg: T[K]) => void) {
    let procs = this.handlers.get(op);
    if (!procs) {
      procs = [];
      this.handlers.set(op, procs);
    }
    procs.push(proc);
  }
}
