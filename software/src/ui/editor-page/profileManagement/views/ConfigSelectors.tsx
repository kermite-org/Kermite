import { jsx } from 'qx';
import { IKeyboardBehaviorMode, IKeyboardLayoutStandard } from '~/shared';
import { texts } from '~/ui/common';
import { useSystemLayoutModel } from '~/ui/common/sharedModels/SystemLayoutModel';
import { DualItemsHoverSelector } from '~/ui/editor-page/components/fabrics/DualItemHoverSelector';
import { keyboardConfigModel } from '~/ui/editor-page/profileManagement/models/KeyboardConfigModel';

export const BehaviorSelector = () => {
  const modes: IKeyboardBehaviorMode[] = ['Standalone', 'SideBrain'];
  const currentMode = keyboardConfigModel.behaviorMode;
  const setCurrent = (mode: IKeyboardBehaviorMode) => {
    keyboardConfigModel.behaviorMode = mode;
  };
  const textDictionary: { [key in IKeyboardBehaviorMode]: string } = {
    Standalone: 'STD',
    SideBrain: 'SIM',
  };

  return (
    <DualItemsHoverSelector
      items={modes}
      currentItem={currentMode}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
      hint={texts.hint_assigner_topBar_keyboardBehaviorModeSelector}
    />
  );
};

export const LayoutStandardSelector = () => {
  const { systemLayoutIndex, setSystemLayoutIndex } = useSystemLayoutModel();
  const layoutIndices: number[] = [0, 1];
  const setCurrent = (layoutIndex: number) => {
    setSystemLayoutIndex(layoutIndex);
  };
  const textDictionary: { [key in number]: string } = {
    0: 'US',
    1: 'JIS',
  };
  return (
    <DualItemsHoverSelector
      items={layoutIndices}
      currentItem={systemLayoutIndex}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
      hint={texts.hint_assigner_topBar_keyboardSystemLayoutSelector}
    />
  );
};
