import { jsx, css, FC } from 'qx';
import { siteModel, WidgetSvgKeyboardView } from '~/ui/common';
import { useWidgetMainPanelModel } from '~/ui/widget/models/WidgetMainPanelModel';
import { WidgetControlButtonsBox } from '~/ui/widget/organisms/WidgetControlButtonsBox';

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
