import {
  IChannel,
  KeyAssignEvent,
  KeyIdKeyEvent,
  KeyIndexKeyEvent,
  KeyTriggerEvent,
  logicSimulatorState
} from './common';

export function traceModule(src: any) {
  console.log(src);
  return null;
}

export function KeyIndexToKeyIdConversionModule(
  src: KeyIndexKeyEvent
): KeyIdKeyEvent | undefined {
  const { keyIndex, isDown } = src;
  const keyId = logicSimulatorState.keyAssignsProvider.keyUnitIdTable[keyIndex];
  return (keyId && { keyId, isDown }) || undefined;
}

export namespace TriggerDetectionModule {
  export function setupChain(
    srcChannel: IChannel<KeyIdKeyEvent>,
    dstChannel: IChannel<KeyTriggerEvent>
  ) {
    srcChannel.subscribe(ev => {
      const { keyId, isDown } = ev;
      if (isDown) {
        dstChannel.emit({ keyId, trigger: 'down' });
      }
    });
  }

  export function processTicker() {}
}

export function AssignMappingModule(
  src: KeyTriggerEvent
): KeyAssignEvent | undefined {
  const { keyId, trigger } = src;
  const { keyAssigns } = logicSimulatorState.keyAssignsProvider;
  const targetLayerId = logicSimulatorState.layerState.currentLayerId;
  const primary = keyAssigns[`${keyId}.${targetLayerId}.pri`];
  if (trigger === 'down' && primary) {
    return { keyId, assign: primary };
  }
  return undefined;
}

export function AssignDriverModule(src: KeyAssignEvent): KeyAssignEvent {
  const { keyId, assign } = src;
  if (assign.type === 'keyInput') {
    console.log('DOWN', assign.virtualKey);
  }
  logicSimulatorState.boundAssigns[keyId] = assign;
  return { keyId, assign };
}
