import { css } from 'goober';
import { h } from 'qx';
import { WidgetSvgKeyboardView } from '~/ui-common-svg/panels/WidgetSvgKeyboardView';
import { makeWidgetMainPageViewModel } from '~/ui-widget/WidgetMainPageViewModel';

const cssMainpanel = css`
  user-select: none;
  -webkit-app-region: drag;
  width: 100%;
  height: 100%;
`;

export function MainPanel() {
  const vm = makeWidgetMainPageViewModel();
  return (
    <div css={cssMainpanel} onDblClick={vm.backToConfiguratorView}>
      <WidgetSvgKeyboardView
        keyboardDesign={vm.keyboardVM.keyboardDesign}
        cardsPartVM={vm.keyboardVM.cardsPartVM}
      />
    </div>
  );
}
