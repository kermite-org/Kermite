import { FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import { reflectFieldChecked } from '~/ui/utils';

export const ShiftCancelOptionPart: FC = () => {
  const { settings } = assignerModel.profileData;
  return (
    <div>
      <label data-hint={texts.hint_assigner_profileConfigModal_shiftCancel}>
        {texts.label_assigner_profileConfigModal_shiftCancel}
        <input
          type="checkbox"
          checked={settings.useShiftCancel}
          onChange={reflectFieldChecked(settings, 'useShiftCancel')}
        />
      </label>
    </div>
  );
};
