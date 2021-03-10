import {
  ConfigStorageFormatRevision,
  generateNumberSequence,
  IKeyboardDeviceStatus,
  IProjectResourceInfo,
  IRealtimeKeyboardEvent,
  IResourceOrigin,
  RawHidMessageProtocolRevision,
} from '~/shared';
import { generateRandomDeviceInstanceCode } from '~/shared/funcs/DomainRelatedHelpers';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { Packets } from '~/shell/services/device/KeyboardDevice/Packets';
import { recievedBytesDecoder } from '~/shell/services/device/KeyboardDevice/ReceivedBytesDecoder';
import { IDeviceWrapper } from './DeviceWrapper';

async function getProjectInfo(
  origin: IResourceOrigin,
  projectId: string,
): Promise<IProjectResourceInfo | undefined> {
  const resourceInfos = await projectResourceProvider.getAllProjectResourceInfos();
  const info = resourceInfos.find(
    (info) => info.origin === origin && info.projectId === projectId,
  );
  return info;
}

function createConnectedStatus(
  info: IProjectResourceInfo,
  deviceInstanceCode: string,
  assignStorageCapacity: number,
): IKeyboardDeviceStatus {
  return {
    isConnected: true,
    deviceAttrs: {
      origin: info.origin,
      projectId: info.projectId,
      keyboardName: info.keyboardName,
      firmwareBuildRevision: info.firmwareBuildRevision,
      deviceInstanceCode,
      assignStorageCapacity,
    },
  };
}

function checkDeviceRevisions(data: {
  projectReleaseBuildRevision: number;
  configStorageFormatRevision: number;
  rawHidMessageProtocolRevision: number;
}) {
  const { configStorageFormatRevision, rawHidMessageProtocolRevision } = data;

  if (configStorageFormatRevision !== ConfigStorageFormatRevision) {
    console.log(
      `incompatible config storage revision (software:${ConfigStorageFormatRevision} firmware:${configStorageFormatRevision})`,
    );
  }
  if (rawHidMessageProtocolRevision !== RawHidMessageProtocolRevision) {
    console.log(
      `incompatible message protocol revision (software:${RawHidMessageProtocolRevision} firmware:${rawHidMessageProtocolRevision})`,
    );
  }
}

export class KeyboardDeviceServiceCore {
  realtimeEventPort = createEventPort<IRealtimeKeyboardEvent>();

  private device: IDeviceWrapper | undefined;

  private deviceStatus: IKeyboardDeviceStatus = {
    isConnected: false,
  };

  statusEventPort = createEventPort<Partial<IKeyboardDeviceStatus>>({
    initialValueGetter: () => this.deviceStatus,
  });

  private setStatus(newStatus: Partial<IKeyboardDeviceStatus>) {
    this.deviceStatus = { ...this.deviceStatus, ...newStatus };
    this.statusEventPort.emit(newStatus);
  }

  private receivedResourceOrigin: IResourceOrigin | undefined;
  private receivedProjectId: string | undefined;
  private instanceCodeInitializationTried = false;
  private parameterInitializationTried = false;

  private initializeDeviceInstanceCode() {
    console.log('write device instance code');
    const code = generateRandomDeviceInstanceCode();
    this.device?.writeSingleFrame(
      Packets.makeDeviceInstanceCodeWriteOperationFrame(code),
    );
    this.device?.writeSingleFrame(Packets.deviceAttributesRequestFrame);
  }

  private async initializeDeviceCustromParameters() {
    if (!this.receivedResourceOrigin || !this.receivedProjectId) {
      return;
    }
    const customDef = await projectResourceProvider.getProjectCustomDefinition(
      this.receivedResourceOrigin,
      this.receivedProjectId,
    );
    if (!customDef) {
      return;
    }
    console.log(`writing initial parameters`);
    const initialParameters = generateNumberSequence(10).map((i) => {
      const paramSpec = customDef.customParameterSpecs.find(
        (paramSpec) => paramSpec.slotIndex === i,
      );
      return paramSpec ? paramSpec.defaultValue : 1;
      // 定義がないパラメタのデフォルト値は1とする。
      // project.jsonでパラメタが定義されていない場合に基本的なオプションを設定値クリアで0にしてしまうと
      // キーストローク出力/LED出力が無効化されてファームウェアが動作しているかどうかを判別できなくなるため
    });
    this.device?.writeSingleFrame(
      Packets.makeCustomParametersBulkWriteOperationFrame(initialParameters),
    );
    this.device?.writeSingleFrame(Packets.customParametersBulkReadRequestFrame);
  }

  private onDeviceDataReceived = async (buf: Uint8Array) => {
    const res = recievedBytesDecoder(buf);
    if (res?.type === 'deviceAttributeResponse') {
      console.log(
        `device attrs received, origin:${res.data.resourceOrigin} projectId: ${res.data.projectId} instanceCode: ${res.data.deviceInstanceCode}`,
      );
      // console.log({ res });
      if (
        !res.data.deviceInstanceCode &&
        !this.instanceCodeInitializationTried
      ) {
        this.instanceCodeInitializationTried = true;
        this.initializeDeviceInstanceCode();
        return;
      }
      checkDeviceRevisions(res.data);
      this.receivedResourceOrigin = res.data.resourceOrigin;
      this.receivedProjectId = res.data.projectId;
      const info = await getProjectInfo(
        res.data.resourceOrigin,
        res.data.projectId,
      );
      if (info) {
        this.setStatus(
          createConnectedStatus(
            info,
            res.data.deviceInstanceCode,
            res.data.assignStorageCapacity,
          ),
        );
      }
    }
    if (res?.type === 'custromParametersReadResponse') {
      console.log(
        `custom parameters received, [${res.data.parameterValues.join(',')}]`,
      );
      if (
        !res.data.isParametersInitialized &&
        !this.parameterInitializationTried
      ) {
        this.parameterInitializationTried = true;
        await this.initializeDeviceCustromParameters();
      }
      if (res.data.isParametersInitialized) {
        this.setStatus({ customParameterValues: res.data.parameterValues });
      }
    }
    if (res?.type === 'realtimeEvent') {
      this.realtimeEventPort.emit(res.event);
    }
  };

  private clearDevice = () => {
    this.setStatus({
      isConnected: false,
      deviceAttrs: undefined,
      customParameterValues: undefined,
    });
    this.device = undefined;
    this.instanceCodeInitializationTried = false;
    this.parameterInitializationTried = false;
    this.receivedResourceOrigin = undefined;
    this.receivedProjectId = undefined;
  };

  setCustomParameterValue(index: number, value: number) {
    this.device?.writeSingleFrame(
      Packets.makeCustomParameterSignleWriteOperationFrame(index, value),
    );
    this.device?.writeSingleFrame(Packets.customParametersBulkReadRequestFrame);
  }

  setDeivce(device: IDeviceWrapper | undefined) {
    this.clearDevice();
    if (device) {
      device.onData(this.onDeviceDataReceived);
      device.onClosed(this.clearDevice);
      device.writeSingleFrame(Packets.deviceAttributesRequestFrame);
      device.writeSingleFrame(Packets.customParametersBulkReadRequestFrame);
    }
    this.device = device;
  }

  private isSideBrainMode = false;

  setSideBrainMode(enabled: boolean) {
    this.isSideBrainMode = enabled;
    if (this.device) {
      console.log(`writeSideBrainMode ${enabled ? 1 : 0}`);
      if (!enabled) {
        const blankHidReport = [0, 0, 0, 0, 0, 0, 0, 0];
        this.writeSideBrainHidReport(blankHidReport);
      }
      const pk = Packets.makeSideBrainModeSpecFrame(enabled);
      this.device.writeSingleFrame(pk);
    }
  }

  writeSideBrainHidReport(report: number[]) {
    if (this.device && this.isSideBrainMode && report.length === 8) {
      console.log(JSON.stringify(report));
      const pk = Packets.makeSideBrainHidReportFrame(report);
      this.device.writeSingleFrame(pk);
    }
  }
}
