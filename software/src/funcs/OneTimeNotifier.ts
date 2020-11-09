export class OneTimeNotifier {
  private listeners: (() => void)[] = [];

  notify() {
    this.listeners.forEach((li) => li());
    this.listeners = [];
  }

  listen = (listener: () => void) => {
    this.listeners.push(listener);
  };
}
