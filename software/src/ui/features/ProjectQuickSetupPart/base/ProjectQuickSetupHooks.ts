import { useState, useEffect } from 'qx';
import { IRealtimeKeyboardEvent } from '~/shared';
import { appUi, ipcAgent } from '~/ui/base';
import { uiState } from '~/ui/store';

export type IAutoConnectionTargetDeviceSpec = {
  projectId: string;
  firmwareVariationId: string;
};

export function useDeviceAutoConnectionConnectionStatus(
  targetDeviceSpec: IAutoConnectionTargetDeviceSpec,
): boolean {
  const { projectId, firmwareVariationId } = targetDeviceSpec;
  const deviceStatus = uiState.core.deviceStatus;
  const isConnectionValid =
    deviceStatus.isConnected &&
    deviceStatus.deviceAttrs.projectId === projectId &&
    deviceStatus.deviceAttrs.variationId === firmwareVariationId;
  return isConnectionValid;
}

export function useDeviceKeyEventIndicatorModel(holdMs: number): boolean {
  const [indicatorState, setIndicatorState] = useState(false);

  const keyEventsHandler = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      setIndicatorState(true);
      setTimeout(() => {
        setIndicatorState(false);
        appUi.rerender();
      }, holdMs);
    }
  };

  useEffect(
    () => ipcAgent.events.device_keyEvents.subscribe(keyEventsHandler),
    [],
  );
  return indicatorState;
}

export function useDeviceAutoConnectionAutoConnectFunction(
  targetDeviceSpec: IAutoConnectionTargetDeviceSpec,
) {
  const { projectId, firmwareVariationId } = targetDeviceSpec;

  const { allDeviceInfos, currentDevicePath } =
    uiState.core.deviceSelectionStatus;

  useEffect(() => {
    const targetDevice = allDeviceInfos.find(
      (it) =>
        it.projectId === projectId && it.variationId === firmwareVariationId,
    );
    if (targetDevice && targetDevice.path !== currentDevicePath) {
      ipcAgent.async.device_connectToDevice(targetDevice.path);
    }
    if (!targetDevice && !currentDevicePath) {
      ipcAgent.async.device_connectToDevice('');
    }
  }, [allDeviceInfos, currentDevicePath, projectId, firmwareVariationId]);
}
