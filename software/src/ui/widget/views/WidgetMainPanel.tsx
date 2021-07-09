import { jsx, css } from 'qx';
import { siteModel } from '~/ui/common';
import { WidgetSvgKeyboardView } from '~/ui/common-svg/panels/WidgetSvgKeyboardView';
import { WidgetControlButton } from '~/ui/widget/components';
import { useWidgetMainPanelModel } from '~/ui/widget/models/WidgetMainPanelModel';

export function WidgetMainPanel() {
  const vm = useWidgetMainPanelModel();
  return (
    <div className={style}>
      <WidgetSvgKeyboardView
        keyboardDesign={vm.keyboardVM.keyboardDesign}
        cards={vm.keyboardVM.cards}
      />
      <div className="control-buttons-box" qxIf={siteModel.isWindowActive}>
        <WidgetControlButton
          className="pinning-button"
          iconSpec="fa fa-thumbtack"
          isActive={vm.isWidgetAlwaysOnTop}
          onClick={vm.toggleWidgetAlwaysOnTop}
        />
        <WidgetControlButton
          className="config-button"
          iconSpec="fa fa-window-restore"
          onClick={vm.backToConfiguratorView}
        />
      </div>
    </div>
  );
}

const style = css`
  width: 100%;
  height: 100%;

  > .control-buttons-box {
    position: absolute;
    top: 0;
    right: 0;
    margin: 5px;
    -webkit-app-region: no-drag;
    display: flex;
    gap: 10px;
  }
`;
