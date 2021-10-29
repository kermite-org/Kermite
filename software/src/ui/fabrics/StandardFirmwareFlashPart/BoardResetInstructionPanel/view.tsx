import { css, FC, jsx } from 'qx';
import { ClosableOverlay } from '~/ui/components';
import { boardResetInstructionPanelAssets } from '~/ui/fabrics/StandardFirmwareFlashPart/BoardResetInstructionPanel/assets';

type Props = {
  isOpen: boolean;
  close(): void;
};
export const BoardResetInstructionPanel: FC<Props> = ({ isOpen, close }) => {
  const { IllustReset1, IllustReset2, IllustReset3 } =
    boardResetInstructionPanelAssets;
  return (
    <ClosableOverlay close={close} qxIf={isOpen}>
      <div class={panelStyle}>
        <div class="top-row">
          <h2>ボードのリセット方法</h2>
          <div onClick={close} class="close-button">
            <i class="fa fa-times" />
          </div>
        </div>
        <div class="inst">
          ファームウェアを書き込むために、以下の方法でMCUをブートローダモードにしてください。
        </div>
        <h3>AVRの場合</h3>
        <div class="row">
          <div class="frame">
            <IllustReset1 />
          </div>
          <div>
            ボード上のリセットボタンを素早く2回押します。 <br />
            (ProMicroを使用した自作キーボードなど)
          </div>
        </div>

        <h3>RP2040の場合</h3>
        <div class="row">
          <div class="frame">
            <IllustReset2 />
          </div>
          <div>
            bootボタンとリセットボタンがある場合,
            bootボタンを押しながらリセットボタンを押して離します。
            <br />
            (ProMicro RP2040など)
          </div>
        </div>
        <div class="row">
          <div class="frame">
            <IllustReset3 />
          </div>
          <div>
            bootボタンのみがある場合、bootボタンを押しながらボードをPCに接続します。
            <br />
            (Raspberry Pi Picoなど)
          </div>
        </div>
        <div class="row">
          <div class="frame">
            <IllustReset1 />
          </div>
          <div>
            リセットボタンがある場合、2回目以降の書込みではリセットボタンを素早く２回押すことでもリセットできます。
          </div>
        </div>
      </div>
    </ClosableOverlay>
  );
};

const panelStyle = css`
  width: 600px;
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  line-height: 1.4;

  > .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    > .close-button {
      cursor: pointer;
    }
  }

  > h3 {
    margin-top: 10px;
  }

  > .inst {
    margin-top: 10px;
  }

  > .row {
    & + .row {
      margin-top: 8px;
    }
    display: flex;
    > .frame {
      flex-shrink: 0;
      width: 140px;
      height: 100px;
      border: solid 1px #888;
      padding: 5px;
      margin-right: 10px;
    }
  }

  > .table {
    display: grid;
    grid-template-columns: 100px auto;
  }
`;
