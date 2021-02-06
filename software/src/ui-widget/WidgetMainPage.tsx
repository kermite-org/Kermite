import { css } from 'goober';
import { h } from 'qx';
import { WidgetSvgKeyboardView } from '~/ui-common-svg/panels/WidgetSvgKeyboardView';
import { siteModel } from '~/ui-common/sharedModels/SiteModel';
import { makeWidgetMainPageViewModel } from '~/ui-widget/WidgetMainPageViewModel';

const cssMainpanel = css`
  position: relative;
  user-select: none;
  -webkit-app-region: drag;
  width: 100%;
  height: 100%;
`;

const cssConfigButton = css`
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
`;

export function MainPanel() {
  const vm = makeWidgetMainPageViewModel();
  return (
    <div css={cssMainpanel}>
      <WidgetSvgKeyboardView
        keyboardDesign={vm.keyboardVM.keyboardDesign}
        cardsPartVM={vm.keyboardVM.cardsPartVM}
      />
      <div
        css={cssConfigButton}
        onClick={vm.backToConfiguratorView}
        qxIf={siteModel.isWindowActive}
      >
        <i className="fa fa-cog" />
      </div>
    </div>
  );
}
