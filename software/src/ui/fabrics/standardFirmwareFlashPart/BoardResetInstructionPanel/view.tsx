import { css, FC, jsx } from 'alumina';
import { languageKey } from '~/ui/base';
import { ClosableOverlay } from '~/ui/components';
import { boardResetInstructionPanelAssets } from '~/ui/fabrics/StandardFirmwareFlashPart/BoardResetInstructionPanel/assets';

type Props = {
  isOpen: boolean;
  close(): void;
};

const textSourceEn = {
  panelTitle: 'How to reset the board',
  summary:
    'To flash firmware, put the MCU into bootloader mode by the following instruction.',
  forAvr: 'For AVR',
  forRp: 'For RP2040',
  avrReset1:
    'Press the reset button on the board twice quickly. \n (e.g. homemade keyboard with ProMicro)',
  rpReset1:
    'If there is a boot button and a reset button, press and release the reset button while holding down the boot button. \n (e.g. ProMicro RP2040)',
  rpReset2:
    'If there is only a boot button, connect the board to the PC while holding down the boot button. \n(e.g. Raspberry Pi Pico)',
  rpReset3:
    'If there is a reset button, you can also reset the board by pressing the reset button twice quickly for the second and subsequent writes.',
};

const textSourceJa = {
  panelTitle: 'ボードのリセット方法',
  summary:
    'ファームウェアを書き込むために、以下の方法でMCUをブートローダモードにしてください。',
  forAvr: 'AVRの場合',
  forRp: 'RP2040の場合',
  avrReset1:
    'ボード上のリセットボタンを素早く2回押します。\n(ProMicroを使用した自作キーボードなど)',
  rpReset1:
    'bootボタンとリセットボタンがある場合、bootボタンを押しながらリセットボタンを押して離します。\n(ProMicro RP2040など)',
  rpReset2:
    'bootボタンだけしかない場合は、bootボタンを押しながらボードをPCに接続します。\n(Raspberry Pi Picoなど)',
  rpReset3:
    'リセットボタンがある場合、2回目以降の書込みではリセットボタンを素早く２回押すことでもリセットできます。',
};

export const BoardResetInstructionPanel: FC<Props> = ({ isOpen, close }) => {
  const { IllustReset1, IllustReset2, IllustReset3 } =
    boardResetInstructionPanelAssets;

  const texts = languageKey === 'japanese' ? textSourceJa : textSourceEn;

  return (
    <ClosableOverlay close={close} if={isOpen}>
      <div class={panelStyle}>
        <div class="top-row">
          <h2>{texts.panelTitle}</h2>
          <div onClick={close} class="close-button">
            <i class="fa fa-times" />
          </div>
        </div>
        <div class="summary">{texts.summary}</div>
        {/* <h3>{texts.forAvr}</h3>
        <div class="row">
          <div class="frame">
            <IllustReset1 />
          </div>
          <div class="inst">{texts.avrReset1}</div>
        </div>

        <h3>{texts.forRp}</h3> */}
        <div class="row">
          <div class="frame">
            <IllustReset2 />
          </div>
          <div class="inst">{texts.rpReset1}</div>
        </div>
        <div class="row">
          <div class="frame">
            <IllustReset3 />
          </div>
          <div class="inst">{texts.rpReset2}</div>
        </div>
        <div class="row">
          <div class="frame">
            <IllustReset1 />
          </div>
          <div class="inst">{texts.rpReset3}</div>
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

  > .summary {
    margin-top: 10px;
    margin-bottom: 10px;
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

    > .inst {
      white-space: pre-wrap;
    }
  }

  > .table {
    display: grid;
    grid-template-columns: 100px auto;
  }
`;
