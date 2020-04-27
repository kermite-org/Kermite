import { IStrokeEmitterFunction, IVirtualStroke } from './Types';
import { HidKeyCodes } from '~defs/HidKeyCodes';

export interface IOutputKeyStateUpdator {
  setKeyDestinationProc(proc: IStrokeEmitterFunction): void;
  handleStroke(stroke: IVirtualStroke, isDown: boolean): void;
  handleModifier(keyCode: number, isDown: boolean): void;
}

export namespace OutputKeyStateUpdator {
  const local: {
    outputKeyState: { [key: number]: true | undefined };
    holdRawShift: boolean;
    keyStrokeDestinationProc: IStrokeEmitterFunction;
  } = {
    outputKeyState: {},
    holdRawShift: false,
    keyStrokeDestinationProc: () => {}
  };

  function setKeyDestinationProc(proc: IStrokeEmitterFunction) {
    local.keyStrokeDestinationProc = proc;
  }

  function emitKeyEvent(keyCode: number, isDown: boolean) {
    local.keyStrokeDestinationProc({ keyCode, isDown });
  }

  function outputKeyboardEvent(
    keyCode: number,
    isDown: boolean,
    retriggerIfNeed?: boolean
  ) {
    const prevState = local.outputKeyState[keyCode];
    if (!prevState && isDown) {
      emitKeyEvent(keyCode, true);
      local.outputKeyState[keyCode] = true;
    }
    if (prevState && isDown && retriggerIfNeed) {
      emitKeyEvent(keyCode, false);
      emitKeyEvent(keyCode, true);
      local.outputKeyState[keyCode] = true;
    }
    if (prevState && !isDown) {
      emitKeyEvent(keyCode, false);
      delete local.outputKeyState[keyCode];
    }
  }

  function handleStroke(stroke: IVirtualStroke, isDown: boolean) {
    const { keyCode, adhocShift, attachedModifierKeyCodes } = stroke;
    if (isDown) {
      attachedModifierKeyCodes?.forEach(m => outputKeyboardEvent(m, true));
      if (adhocShift) {
        outputKeyboardEvent(HidKeyCodes.K_Shift, adhocShift === 'down');
      }
      outputKeyboardEvent(keyCode, true, true);
    } else {
      outputKeyboardEvent(keyCode, false);
      if (adhocShift) {
        outputKeyboardEvent(HidKeyCodes.K_Shift, local.holdRawShift);
      }
      attachedModifierKeyCodes?.forEach(m => outputKeyboardEvent(m, false));
    }
  }

  function handleModifier(keyCode: number, isDown: boolean) {
    outputKeyboardEvent(keyCode, isDown);
    if (keyCode === HidKeyCodes.K_Shift) {
      local.holdRawShift = isDown;
    }
  }

  export function getInterface(): IOutputKeyStateUpdator {
    return {
      setKeyDestinationProc,
      handleStroke,
      handleModifier
    };
  }
}
