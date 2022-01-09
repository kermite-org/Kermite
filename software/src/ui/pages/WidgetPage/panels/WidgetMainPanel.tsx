import { jsx, css, FC } from 'alumina';
import { WidgetSvgKeyboardView } from '~/ui/elements/keyboard';
import { useWidgetMainPanelModel } from '~/ui/pages/WidgetPage/models/WidgetMainPanelModel';
import { WidgetControlButtonsBox } from '~/ui/pages/WidgetPage/organisms/WidgetControlButtonsBox';
import { siteModel } from '~/ui/store';

export const WidgetMainPanel: FC = () => {
  const vm = useWidgetMainPanelModel();
  return (
    <div class={style}>
      <WidgetSvgKeyboardView
        keyboardDesign={vm.keyboardVM.keyboardDesign}
        cards={vm.keyboardVM.cards}
      />
      <WidgetControlButtonsBox
        class="control-buttons-box"
        vm={vm}
        if={siteModel.isWindowActive}
      />
    </div>
  );
};

const style = css`
  width: 100%;
  height: 100%;

  > .control-buttons-box {
    position: absolute;
    top: 0;
    right: 0;
    margin: 5px;
    -webkit-app-region: no-drag;
  }
`;
