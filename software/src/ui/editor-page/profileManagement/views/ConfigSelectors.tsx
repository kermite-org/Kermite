import { jsx } from 'qx';
import { IKeyboardBehaviorMode, IKeyboardLayoutStandard } from '~/shared';
import { texts } from '~/ui/common';
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
  const layouts: IKeyboardLayoutStandard[] = ['US', 'JIS'];
  const currentLayout = keyboardConfigModel.layoutStandard;
  const setCurrent = (layout: IKeyboardLayoutStandard) => {
    keyboardConfigModel.layoutStandard = layout;
  };
  const textDictionary: { [key in IKeyboardLayoutStandard]: string } = {
    US: 'US',
    JIS: 'JIS',
  };
  return (
    <DualItemsHoverSelector
      items={layouts}
      currentItem={currentLayout}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
      hint={texts.hint_assigner_topBar_keyboardSystemLayoutSelector}
    />
  );
};
