import { css, FC, jsx } from 'alumina';
import { IProjectPackageInfo } from '~/shared';
import { ipcAgent, languageKey, texts } from '~/ui/base';
import { useModalDisplayStateModel } from '~/ui/commonModels';
import { GeneralButton } from '~/ui/components';
import { svgImage_resetByHand } from '~/ui/constants';
import { BoardResetInstructionPanel } from '~/ui/fabrics/standardFirmwareFlashPart/boardResetInstructionPanel/view';
import { useStandardFirmwareFlashPartModel } from '~/ui/fabrics/standardFirmwareFlashPart/model';

type Props = {
  projectInfo: IProjectPackageInfo;
  variationId: string;
};

const localTextSources = {
  english: {
    p1: `1. Reset the device to bootloader mode.`,
    p2: `2. Download the uf2 file and write it to the device's drive.`,
    p3: `3. Connect to the device. Press the button and select your device from the list.`,
    btnUf2Download: 'download uf2 file',
    btnAddDevice: 'add device',
  },
  japanese: {
    p1: '1.デバイスをリセットしてブートローダモードにします。',
    p2: '2.uf2ファイルをダウンロードしてデバイスのドライブに書き込みます。',
    p3: '3.デバイスに接続します。以下のボタンを押して、リストからデバイスを選択してください。',
    btnUf2Download: 'uf2ファイルダウンロード',
    btnAddDevice: 'デバイスを追加',
  },
};

export const StandardFirmwareFlashPart: FC<Props> = ({
  projectInfo,
  variationId,
}) => {
  const {
    phase,
    detectedDeviceSig,
    canFlashFirmwareToDetectedDevice,
    onWriteButton,
    onDownloadButton,
    targetDeviceType,
  } = useStandardFirmwareFlashPartModel(projectInfo, variationId);

  const {
    isOpen: isPanelOpen,
    open: openPanel,
    close: closePanel,
  } = useModalDisplayStateModel();

  const onDeviceAddButton = () => {
    ipcAgent.async.device_requestAddNewHidDevice();
  };

  const localTexts = localTextSources[languageKey];

  return (
    <div class={style}>
      <div class="top-row">
        <div class="target-mcu-text">
          {targetDeviceType &&
            `${texts.firmwareFlashSection.targetMcu}: ${targetDeviceType}`}
        </div>

        <div class="how-to-reset" onClick={openPanel}>
          {texts.firmwareFlashSection.howToReset}
        </div>
      </div>
      <div class="image-box">{svgImage_resetByHand}</div>
      <div class="text-part2">
        <p>{localTexts.p1}</p>
        <div>
          <p>{localTexts.p2}</p>
          <div>
            <button
              onClick={onDownloadButton}
              disabled={targetDeviceType !== 'rp2040'}
            >
              {localTexts.btnUf2Download}
            </button>
          </div>
        </div>
        <div>
          <p>{localTexts.p3}</p>
          <div>
            <button onClick={onDeviceAddButton}>
              {localTexts.btnAddDevice}
            </button>
          </div>
        </div>
      </div>
      <div class="text-part" if={false}>
        {phase === 'WaitingReset' && (
          <div>{texts.firmwareFlashSection.resetDeviceToFlashFirmware}</div>
        )}

        {phase === 'WaitingUploadOrder' && detectedDeviceSig && (
          <div class="row">
            <div>
              {texts.deviceFirmwareUpdate.deviceDetected.replace(
                '{DEVICE_NAME}',
                detectedDeviceSig,
              )}
            </div>
            {canFlashFirmwareToDetectedDevice && (
              <GeneralButton
                onClick={onWriteButton}
                text={texts.deviceFirmwareUpdate.writeButton}
                class="btn"
              />
            )}
          </div>
        )}

        {phase === 'WaitingUploadOrder' &&
          detectedDeviceSig &&
          !canFlashFirmwareToDetectedDevice && (
            <div class="note">
              {texts.firmwareFlashSection.deviceIncompatible}
            </div>
          )}

        {phase === 'Uploading' && (
          <div>
            <div>{texts.deviceFirmwareUpdate.writing}</div>
          </div>
        )}
      </div>
      <BoardResetInstructionPanel isOpen={isPanelOpen} close={closePanel} />
    </div>
  );
};

const style = css`
  > .top-row {
    width: 300px;
    margin: 0 auto;
    margin-top: 10px;
    display: flex;
    align-items: center;

    > .how-to-reset {
      margin-left: auto;
      color: #999;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  > .image-box {
    margin: 20px auto;
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border: solid 1px #aaa;
    border-radius: 6px;
    overflow: hidden;
  }

  > .text-part2 {
    width: 300px;
    margin: 0 auto;
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    button {
      padding: 2px 7px;
      margin-top: 2px;
    }
  }
  > .text-part {
    width: 300px;
    margin: 0 auto;
    margin-top: 15px;

    > .row {
      display: flex;

      > .btn {
        flex-shrink: 0;
      }
    }
  }
`;
