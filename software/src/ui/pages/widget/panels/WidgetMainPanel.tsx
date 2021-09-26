import { jsx, css, FC } from 'qx';
import { WidgetSvgKeyboardView } from '~/ui/components/keyboard';
import { useWidgetMainPanelModel } from '~/ui/pages/widget/models/WidgetMainPanelModel';
import { WidgetControlButtonsBox } from '~/ui/pages/widget/organisms/WidgetControlButtonsBox';
import { siteModel } from '~/ui/store';

export const WidgetMainPanel: FC = () => {
  const vm = useWidgetMainPanelModel();
  return (
    <div className={style}>
      <WidgetSvgKeyboardView
        keyboardDesign={vm.keyboardVM.keyboardDesign}
        cards={vm.keyboardVM.cards}
      />
      <WidgetControlButtonsBox
        className="control-buttons-box"
        vm={vm}
        qxIf={siteModel.isWindowActive}
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
