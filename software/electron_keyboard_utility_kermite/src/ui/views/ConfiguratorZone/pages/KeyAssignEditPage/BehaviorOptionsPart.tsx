import { h } from '~lib/qx';
import { uiStatusModel } from '~ui/models';
import { reflectFieldChecked } from '~ui/views/base/FormHelpers';

export const BehaviorOptionsPart = () => {
  const { settings } = uiStatusModel;

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.showLayersDynamic}
          onChange={reflectFieldChecked(settings, 'showLayersDynamic')}
        />
        Show Layers Dynamic
      </label>
    </div>
  );
};
