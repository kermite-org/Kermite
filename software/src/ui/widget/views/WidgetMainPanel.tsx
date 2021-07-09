import { jsx, css } from 'qx';
import { siteModel } from '~/ui/common';
import { WidgetSvgKeyboardView } from '~/ui/common-svg/panels/WidgetSvgKeyboardView';
import { WidgetControlButton } from '~/ui/widget/components';
import { useWidgetMainPanelModel } from '~/ui/widget/models/WidgetMainPanelModel';

const style = css`
  user-select: none;

  width: 100%;
  height: 100%;
  padding: 4px;

  > .pannel-inner-content {
    position: relative;
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;

    > .control-buttons-box {
      position: absolute;
      top: 0;
      right: 0;
      margin: 5px;
      -webkit-app-region: no-drag;
      display: flex;
      gap: 10px;
    }
  }
`;

export function WidgetMainPanel() {
  const vm = useWidgetMainPanelModel();
  return (
    <div css={style}>
      <div className="pannel-inner-content">
        <WidgetSvgKeyboardView
          keyboardDesign={vm.keyboardVM.keyboardDesign}
          cards={vm.keyboardVM.cards}
        />
        <div className="control-buttons-box" qxIf={siteModel.isWindowActive}>
          <WidgetControlButton
            className="pinning-button"
            iconSpec="fa fa-thumbtack"
            onClick={() => {}}
          />
          <WidgetControlButton
            className="config-button"
            iconSpec="fa fa-cog"
            onClick={vm.backToConfiguratorView}
          />
        </div>
      </div>
    </div>
  );
}
