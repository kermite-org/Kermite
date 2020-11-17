import { h } from '~lib/qx';
import {
  IKeyboardBehaviorMode,
  IKeyboardLayoutStandard
} from '~defs/ConfigTypes';
import { models } from '~ui/models';
import { DualItemsHoverSelector } from '~ui/views/fabrics/DualItemHoverSelector';

export const BehaviorSelector = () => {
  const modes: IKeyboardBehaviorMode[] = ['Standalone', 'SideBrain'];
  const currentMode = models.keyboardConfigModel.behaviorMode;
  const setCurrent = (mode: IKeyboardBehaviorMode) => {
    models.keyboardConfigModel.behaviorMode = mode;
  };
  const textDictionary: { [key in IKeyboardBehaviorMode]: string } = {
    Standalone: 'STD',
    SideBrain: 'SB'
  };

  return (
    <DualItemsHoverSelector
      items={modes}
      currentItem={currentMode}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
    />
  );
};

export const LayoutStandardSelector = () => {
  const layouts: IKeyboardLayoutStandard[] = ['US', 'JIS'];
  const currentLayout = models.keyboardConfigModel.layoutStandard;
  const setCurrent = (layout: IKeyboardLayoutStandard) => {
    models.keyboardConfigModel.layoutStandard = layout;
  };
  const textDictionary: { [key in IKeyboardLayoutStandard]: string } = {
    US: 'US',
    JIS: 'JIS'
  };
  return (
    <DualItemsHoverSelector
      items={layouts}
      currentItem={currentLayout}
      setCurrentItem={setCurrent}
      textDictionary={textDictionary}
    />
  );
};
