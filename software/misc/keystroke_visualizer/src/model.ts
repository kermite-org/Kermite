import { appUi } from '~basis/appGlobal';

interface StrokeEvent {
  key: string;
  isDown: boolean;
  timePos: number;
}

export const appModel = new (class {
  //state
  strokeEvents: StrokeEvent[] = [];
  epic: number = 0;
  inputText: string = '';

  //mutations
  pushStroke = (key: string, isDown: boolean) => {
    if (Date.now() > this.epic + 3000 && isDown) {
      this.clearStrokeEvents();
    }

    if (this.strokeEvents.length === 0) {
      this.epic = Date.now();
    }
    const timePos = Date.now() - this.epic;

    console.log(key, isDown, timePos);

    this.strokeEvents.push({ key, isDown, timePos });
    if (isDown) {
      this.inputText += key;
    }
  };

  clearStrokeEvents = () => {
    this.strokeEvents = [];
    this.inputText = '';
  };
})();

export function initializeModel() {
  function handleKeyboardEvent(e: KeyboardEvent) {
    if (e.repeat) {
      return;
    }
    const kSpace = 32;
    if (e.keyCode === kSpace) {
      appModel.clearStrokeEvents();
    } else {
      appModel.pushStroke(e.key, e.type === 'keydown');
    }
    appUi.rerender();
  }
  window.addEventListener('keydown', handleKeyboardEvent);
  window.addEventListener('keyup', handleKeyboardEvent);
}
