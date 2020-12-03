import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';

const cssHeatmapPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};

  height: 100%;
  padding: 20px;
  > * + * {
    margin-top: 10px;
  }
`;

export const HeatmapPage = () => {
  return <div css={cssHeatmapPage}>Realtime Heatmap</div>;
};
