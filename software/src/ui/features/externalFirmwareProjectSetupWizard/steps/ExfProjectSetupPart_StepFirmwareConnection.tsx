import { css, domStyled, FC, jsx } from 'alumina';
import { colors, ipcAgent, languageKey } from '~/ui/base';
import { ProjectKeyboardNameEditPart } from '~/ui/fabrics';
import { exfProjectSetupStore } from '~/ui/features/externalFirmwareProjectSetupWizard/store/exfProjectSetupStore';

const PlainLink: FC<{ url: string }> = ({ url }) => <a href={url}>{url}</a>;

const PlainButton: FC<{ text: string; onClick(): void }> = ({
  text,
  onClick,
}) =>
  domStyled(
    <button onClick={onClick}>{text}</button>,
    css`
      padding: 2px 8px;
    `,
  );

export const ExfProjectSetupPart_StepFirmwareConnection: FC = () => {
  const isLangJa = languageKey === 'japanese';
  const onDeviceAddButton = () => {
    ipcAgent.async.device_requestAddNewHidDevice();
  };

  const { keyboardName } = exfProjectSetupStore.state;
  const { keyboardNameValidationError } = exfProjectSetupStore.readers;
  const { setKeyboardName } = exfProjectSetupStore.actions;

  return (
    <div class={style}>
      <div class="top-row" if={!isLangJa}>
        <div>
          This wizard creates a project that uses firmware created externally.
        </div>
        <div>
          <p>
            Create firmware inf Arduino or PlatformIO environment and write it
            to the MCU.
            <br />
            For information how to make firmware, refer the resources below.
          </p>
          <p>
            KermiteCore_Arduino:&nbsp;
            <PlainLink url="https://github.com/kermite-org/KermiteCore_Arduino" />
          </p>
        </div>

        <div>
          Set arbitrary project name.
          <ProjectKeyboardNameEditPart
            keyboardName={keyboardName}
            setKeyboardName={setKeyboardName}
            validationError={keyboardNameValidationError}
          />
        </div>
        <div>
          Connect to the device.
          <PlainButton onClick={onDeviceAddButton} text="デバイスを追加" />
        </div>
      </div>

      <div class="top-row" if={isLangJa}>
        <div>
          このウィザードでは、外部で作成したファームウェアを利用するプロジェクトを作成します。
        </div>
        <div>
          <p>
            ArduinoやPlatformIOなどの環境でファームウェアを作成し、MCUに書き込んでください。
            <br />
            ファームウェアの作り方は、以下のリソースを参照してください。
          </p>
          <p>
            KermiteCore_Arduino:&nbsp;
            <PlainLink url="https://github.com/kermite-org/KermiteCore_Arduino" />
          </p>
          <p if={false}>
            (参考)日本語での解説:&nbsp;
            <PlainLink url="https://zenn.dev/yahiro04/articles/kermite_2301xx" />
          </p>
        </div>

        <div>
          プロジェクト名を設定します。
          <ProjectKeyboardNameEditPart
            keyboardName={keyboardName}
            setKeyboardName={setKeyboardName}
            validationError={keyboardNameValidationError}
          />
        </div>
        <div>
          デバイスに接続します。
          <PlainButton onClick={onDeviceAddButton} text="デバイスを追加" />
        </div>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .top-row {
    border: solid 1px ${colors.clPrimary};
    background: ${colors.clPanelBox};
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;

    > div {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
`;
