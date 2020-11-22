export class OneTimeNotifier {
  private listeners: (() => void)[] = [];

  private done: boolean = false;

  notify() {
    this.listeners.forEach((li) => li());
    this.listeners = [];
    this.done = true;
  }

  listen = (listener: () => void) => {
    if (!this.done) {
      this.listeners.push(listener);
    } else {
      listener();
    }
  };
}
