import { jsx } from 'qx';
import { reflectFieldChecked, texts } from '~/ui/common';
import { editorModel } from '~/ui/editor-page/models/EditorModel';

export const ShiftCancelOptionPart = () => {
  const { settings } = editorModel.profileData;
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
