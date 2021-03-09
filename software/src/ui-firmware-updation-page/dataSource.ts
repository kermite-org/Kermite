import { useEventSource, ipcAgent, useFetcher } from '~/ui-common';

export function useDeviceSelectionStatus() {
  return useEventSource(ipcAgent.events.device_deviceSelectionEvents, {
    allDeviceInfos: [],
    currentDevicePath: 'none',
  });
}

export function useConnectedDeviceAttributes() {
  const deviceStatus = useEventSource(
    ipcAgent.events.device_keyboardDeviceStatusEvents,
    {
      isConnected: false,
    },
  );
  const deviceAttrs =
    (deviceStatus.isConnected && deviceStatus.deviceAttrs) || undefined;

  const resourceInfos = useFetcher(
    ipcAgent.async.projects_getAllProjectResourceInfos,
    [],
  );
  const projectInfo = resourceInfos.find(
    (info) =>
      info.origin === deviceAttrs?.origin &&
      info.projectId === deviceAttrs?.projectId,
  );

  return { deviceAttrs, projectInfo };
}
