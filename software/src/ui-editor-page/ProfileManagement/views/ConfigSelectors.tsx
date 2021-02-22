import { h } from 'qx';
import { IKeyboardBehaviorMode, IKeyboardLayoutStandard } from '~/shared';
import { keyboardConfigModel } from '~/ui-editor-page/ProfileManagement/models/KeyboardConfigModel';
import { DualItemsHoverSelector } from '~/ui-editor-page/components/fabrics/DualItemHoverSelector';

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
      hint="Select keyboard behavior mode. (STD: Standalone Mode, SIM: Simulation Mode)"
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
      hint="Select keyboard system layout."
    />
  );
};
