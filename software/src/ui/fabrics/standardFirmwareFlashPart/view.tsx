import { css, FC, jsx } from 'alumina';
import { IProjectPackageInfo } from '~/shared';
import { ipcAgent, texts } from '~/ui/base';
import { useModalDisplayStateModel } from '~/ui/commonModels';
import { GeneralButton } from '~/ui/components';
import { svgImage_resetByHand } from '~/ui/constants';
import { BoardResetInstructionPanel } from '~/ui/fabrics/StandardFirmwareFlashPart/BoardResetInstructionPanel/view';
import { useStandardFirmwareFlashPartModel } from '~/ui/fabrics/StandardFirmwareFlashPart/model';

type Props = {
  projectInfo: IProjectPackageInfo;
  variationId: string;
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
    ipcAgent.async.device_selectHidDevice();
  };

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
        <p>1.デバイスをリセットしてブートローダモードにします。</p>
        <div>
          <p>
            2.uf2ファイルをダウンロードしてデバイスのドライブに書き込みます。
          </p>
          <div>
            <button
              onClick={onDownloadButton}
              disabled={targetDeviceType !== 'rp2040'}
            >
              uf2ファイルダウンロード
            </button>
          </div>
        </div>
        <div>
          <p>
            3.デバイスに接続します。以下のボタンを押して、リストからデバイスを選択してください。
          </p>
          <div>
            <button onClick={onDeviceAddButton}>add device</button>
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
