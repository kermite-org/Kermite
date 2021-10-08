import { css, FC, jsx } from 'qx';
import { IShiftCancelMode } from '~/shared';
import { makePlainSelectorOption, texts } from '~/ui/base';
import { GeneralSelector } from '~/ui/components';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';

export const ShiftCancelOptionPart: FC = () => {
  const { settings } = assignerModel.profileData;
  const { writeSettingsValue } = assignerModel;
  return (
    <div css={style}>
      <label data-hint={texts.hint_assigner_profileConfigModal_shiftCancel}>
        {texts.label_assigner_profileConfigModal_shiftCancel}
      </label>
      <GeneralSelector
        options={['none', 'shiftLayer', 'all'].map(makePlainSelectorOption)}
        value={settings.shiftCancelMode}
        setValue={(value: IShiftCancelMode) =>
          writeSettingsValue('shiftCancelMode', value)
        }
      />
    </div>
  );
};

const style = css`
  display: flex;
  align-items: center;

  > label {
    margin-right: 10px;
  }
`;
