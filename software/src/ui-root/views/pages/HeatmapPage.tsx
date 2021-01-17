import { uiTheme } from '@ui-common';
import { css } from 'goober';
import { h } from 'qx';
import { makeRealtimeHeatmapViewModel } from '~/viewModels/RealtimeHeatmapViewModel';
import { GeneralButton } from '~/views/controls/GeneralButton';
import { HeatmapKeyboardView } from '~/views/keyboardSvg/panels/HeatmapKeyboardView';

const cssHeatmapPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};

  height: 100%;
  padding: 20px;
  > * + * {
    margin-top: 10px;
  }

  .headRow {
    display: flex;
    align-items: center;

    .text {
      font-size: 18px;
    }

    > * + * {
      margin-left: 20px;
    }
  }
`;

export const HeatmapPage = () => {
  const vm = makeRealtimeHeatmapViewModel();

  if (!vm.keyboardVM.displayArea) {
    return <div>incompatible keyboardShape, displayArea is not defined</div>;
  }

  return (
    <div css={cssHeatmapPage}>
      <div>Realtime Heatmap</div>
      <div class="headRow">
        <GeneralButton
          handler={vm.startRecording}
          text="start"
          disabled={vm.isRecording || vm.hasRecord}
        />
        <GeneralButton
          handler={vm.stopRecording}
          text="stop"
          disabled={!vm.isRecording}
        />

        <GeneralButton
          handler={vm.clearRecord}
          text="clear"
          disabled={!(!vm.isRecording && vm.hasRecord)}
        />
        <div class="text">{vm.timeText}</div>
        <div class="text">{vm.numTotalTypes}</div>
      </div>
      <HeatmapKeyboardView vm={vm.keyboardVM} />
    </div>
  );
};
