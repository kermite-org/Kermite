import { jsx, css } from 'qx';
import { siteModel } from '~/ui/common';
import { WidgetSvgKeyboardView } from '~/ui/common-svg/panels/WidgetSvgKeyboardView';
import { useWidgetMainPanelModel } from '~/ui/widget/models/WidgetMainPanelModel';
import { WidgetControlButton } from '~/ui/widget/views/WidgetControlButton';

const style = css`
  position: relative;
  user-select: none;

  width: 100%;
  height: 100%;
  padding: 6px;

  > .inner {
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;

    > .config-button {
      position: absolute;
      right: 0px;
      top: 0px;
      -webkit-app-region: no-drag;
    }
  }
`;

export function WidgetMainPanel() {
  const vm = useWidgetMainPanelModel();
  return (
    <div css={style}>
      <div className="inner">
        <WidgetSvgKeyboardView
          keyboardDesign={vm.keyboardVM.keyboardDesign}
          cards={vm.keyboardVM.cards}
        />
        <WidgetControlButton
          className="config-button"
          iconSpec="fa fa-cog"
          onClick={vm.backToConfiguratorView}
          qxIf={siteModel.isWindowActive}
        />
      </div>
    </div>
  );
}
