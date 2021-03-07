import {
  ConfigStorageFormatRevision,
  generateNumberSequence,
  IKeyboardDeviceStatus,
  IProjectResourceInfo,
  IRealtimeKeyboardEvent,
  RawHidMessageProtocolRevision,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';
import { projectResourceProvider } from '~/shell/projectResources';
import { Packets } from '~/shell/services/device/KeyboardDevice/Packets';
import { recievedBytesDecoder } from '~/shell/services/device/KeyboardDevice/ReceivedBytesDecoder';
import { IDeviceWrapper } from './DeviceWrapper';

async function getProjectInfoFromProjectId(
  projectId: string,
): Promise<IProjectResourceInfo | undefined> {
  const resourceInfos = await projectResourceProvider.getAllProjectResourceInfos();
  const info = resourceInfos.find((info) => info.projectId === projectId);
  return info;
}

function createConnectedStatus(
  info: IProjectResourceInfo,
  assignStorageCapacity: number,
): IKeyboardDeviceStatus {
  return {
    isConnected: true,
    deviceAttrs: {
      projectId: info.projectId,
      keyboardName: info.keyboardName,
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

  private receivedProjectId: string = '';
  private parameterInitializationTried = false;

  private async initializeDeviceCustromParameters() {
    const info = await getProjectInfoFromProjectId(
      this.receivedProjectId || '',
    );
    if (!info) {
      return;
    }
    console.log(`writing initial parameters`);
    const initialParameters = generateNumberSequence(10).map((i) => {
      const paramSpec = info.customParameters.find(
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
        `device attrs received, origin:${res.data.resourceOrigin} projectId: ${res.data.projectId}`,
      );
      checkDeviceRevisions(res.data);
      this.receivedProjectId = res.data.projectId;
      const info = await getProjectInfoFromProjectId(res.data.projectId);
      if (info) {
        this.setStatus(
          createConnectedStatus(info, res.data.assignStorageCapacity),
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
    this.parameterInitializationTried = false;
    this.receivedProjectId = '';
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
