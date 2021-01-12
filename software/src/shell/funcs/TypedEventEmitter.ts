export class TypedEventEmitter<T> {
  private handlers: Map<keyof T, Function[]> = new Map();

  emit<K extends keyof T>(op: K, ...args: T[K] extends never ? [] : [T[K]]) {
    const procs = this.handlers.get(op);
    if (procs) {
      for (const proc of procs) {
        proc(args[0]);
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

  off<K extends keyof T>(op: K, proc: (arg: T[K]) => void) {
    const procs = this.handlers.get(op);
    if (procs) {
      for (let i = 0; i < procs.length; i++) {
        if (procs[i] === proc) {
          procs.splice(i, 1);
          continue;
        }
      }
    }
  }
}
