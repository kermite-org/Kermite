import { jsx, css } from 'qx';
import { WidgetSvgKeyboardView } from '~/ui/common-svg/panels/WidgetSvgKeyboardView';
import { siteModel } from '~/ui/common/sharedModels/SiteModel';
import { useWidgetMainPanelModel } from '~/ui/widget/models/WidgetMainPanelModel';

const style = css`
  position: relative;
  user-select: none;
  -webkit-app-region: drag;
  width: 100%;
  height: 100%;

  > .config-button {
    position: absolute;
    right: 0px;
    top: 0px;
    -webkit-app-region: no-drag;
    color: #fff;
    width: 30px;
    height: 30px;
    margin: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 20px;
    background: #888;

    &:hover {
      background: #0cf;
    }
  }
`;

export function WidgetMainPanel() {
  const vm = useWidgetMainPanelModel();
  return (
    <div css={style}>
      <WidgetSvgKeyboardView
        keyboardDesign={vm.keyboardVM.keyboardDesign}
        cards={vm.keyboardVM.cards}
      />
      <div
        className="config-button"
        onClick={vm.backToConfiguratorView}
        qxIf={siteModel.isWindowActive}
      >
        <i className="fa fa-cog" />
      </div>
    </div>
  );
}
