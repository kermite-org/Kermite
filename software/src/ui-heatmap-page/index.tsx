import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui-common';
import { HeatmapKeyboardView } from '~/ui-common-svg/panels/HeatmapKeyboardView';
import { GeneralButton } from '~/ui-common/components';
import { useRealtimeHeatmapPageModel } from '~/ui-heatmap-page/models';

const style = css`
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

export const RealtimeHeatmapPage: FC = () => {
  const {
    startRecording,
    stopRecording,
    isRecording,
    hasRecord,
    clearRecord,
    timeText,
    numTotalTypes,
    keyboardVM,
  } = useRealtimeHeatmapPageModel();

  if (!keyboardVM.displayArea) {
    return <div>incompatible keyboardShape, displayArea is not defined</div>;
  }

  return (
    <div css={style}>
      <div>Realtime Heatmap</div>
      <div class="headRow">
        <GeneralButton
          onClick={startRecording}
          text="start"
          disabled={isRecording || hasRecord}
        />
        <GeneralButton
          onClick={stopRecording}
          text="stop"
          disabled={!isRecording}
        />

        <GeneralButton
          onClick={clearRecord}
          text="clear"
          disabled={!(!isRecording && hasRecord)}
        />
        <div class="text">{timeText}</div>
        <div class="text">{numTotalTypes}</div>
      </div>
      <HeatmapKeyboardView vm={keyboardVM} />
    </div>
  );
};
