import { useState, useEffect } from 'qx';
import { IRealtimeKeyboardEvent } from '~/shared';
import { appUi, ipcAgent } from '~/ui/base';
import { uiState } from '~/ui/store';

type IAutoConnectionTargetDeviceSpec = {
  projectId: string;
  firmwareVariationId: string | undefined;
};

type IDeviceAutoConnectionEffectsResult = {
  isConnectionValid: boolean;
  isCommunicationIndicatorActive: boolean;
};

function useDeviceAutoConnectionConnectionStatus(
  targetDeviceSpec: IAutoConnectionTargetDeviceSpec,
): boolean {
  const { projectId, firmwareVariationId } = targetDeviceSpec;
  const deviceStatus = uiState.core.deviceStatus;

  if (firmwareVariationId) {
    return (
      deviceStatus.isConnected &&
      deviceStatus.deviceAttrs.projectId === projectId &&
      deviceStatus.deviceAttrs.variationId === firmwareVariationId
    );
  } else {
    return (
      deviceStatus.isConnected &&
      deviceStatus.deviceAttrs.projectId === projectId
    );
  }
}

function useDeviceKeyEventIndicatorModel(holdMs: number): boolean {
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

function useDeviceAutoConnectionAutoConnectFunction(
  targetDeviceSpec: IAutoConnectionTargetDeviceSpec,
) {
  const { projectId, firmwareVariationId } = targetDeviceSpec;

  const { allDeviceInfos, currentDevicePath } =
    uiState.core.deviceSelectionStatus;

  useEffect(() => {
    const targetDevice = allDeviceInfos.find((it) =>
      firmwareVariationId
        ? it.projectId === projectId && it.variationId === firmwareVariationId
        : it.projectId === projectId,
    );
    if (targetDevice && targetDevice.path !== currentDevicePath) {
      ipcAgent.async.device_connectToDevice(targetDevice.path);
    }
    if (!targetDevice && !currentDevicePath) {
      ipcAgent.async.device_connectToDevice('');
    }
  }, [allDeviceInfos, currentDevicePath, projectId, firmwareVariationId]);
}

export function useDeviceAutoConnectionEffects(
  projectId: string,
  firmwareVariationId: string,
): IDeviceAutoConnectionEffectsResult {
  const targetDeviceSpec = { projectId, firmwareVariationId };
  useDeviceAutoConnectionAutoConnectFunction(targetDeviceSpec);
  const isConnectionValid =
    useDeviceAutoConnectionConnectionStatus(targetDeviceSpec);
  const isIndicatorActive = useDeviceKeyEventIndicatorModel(200);

  return {
    isConnectionValid,
    isCommunicationIndicatorActive: isConnectionValid && isIndicatorActive,
  };
}
