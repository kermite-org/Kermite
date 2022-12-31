import { css, FC, jsx } from 'alumina';
import { IShiftCancelMode, makePlainSelectorOption, texts } from '~/app-shared';
import { GeneralSelector } from '~/fe-shared';
import { assignerModel } from '../models';

export const ShiftCancelOptionPart: FC = () => {
  const { settings } = assignerModel.profileData;
  const { writeSettingsValue } = assignerModel;
  return (
    <div class={style}>
      <label data-hint={texts.assignerProfileConfigModalHint.shiftCancel}>
        {texts.assignerProfileConfigModal.shiftCancel}
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
