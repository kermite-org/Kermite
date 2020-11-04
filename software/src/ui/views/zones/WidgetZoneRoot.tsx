import { css } from 'goober';
import { h } from '~lib/qx';
import { ViewModels } from '~ui/viewModels';
import { WidgetWindowActiveChrome } from '~ui/views/layout/WidgetWindowActiveChrome';
import { MainPanel } from '~ui/views/pages/WidgetMainPage';

export const WidgetZoneRoot = (props: { viewModels: ViewModels }) => {
  const cssRoot = css`
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;

    &[data-window-active] {
    }
  `;

  return (
    <div css={cssRoot}>
      <WidgetWindowActiveChrome
        qxIf={props.viewModels.models.siteModel.isWindowActive}
      />
      <MainPanel vm={props.viewModels.wdigetMainPage} />
    </div>
  );
};
