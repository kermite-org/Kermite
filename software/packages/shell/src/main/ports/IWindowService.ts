export interface IWindowService {
  getWindowWrapper(): {
    minimizeMainWindow(): void;
    maximizeMainWindow(): void;
    closeMainWindow(): void;
  };
  initialize(): void;
  terminate(): void;
}
