import { h } from 'qx';
import { IKeyboardBehaviorMode, IKeyboardLayoutStandard } from '~/shared';
import { models } from '~/ui-root/zones/common/commonModels';
import { DualItemsHoverSelector } from '~/ui-root/zones/common/parts/fabrics/DualItemHoverSelector';

export const BehaviorSelector = () => {
  const modes: IKeyboardBehaviorMode[] = ['Standalone', 'SideBrain'];
  const currentMode = models.keyboardConfigModel.behaviorMode;
  const setCurrent = (mode: IKeyboardBehaviorMode) => {
    models.keyboardConfigModel.behaviorMode = mode;
  };
  const textDictionary: { [key in IKeyboardBehaviorMode]: string } = {
    Standalone: 'STD',
    SideBrain: 'SB',
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
    JIS: 'JIS',
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
