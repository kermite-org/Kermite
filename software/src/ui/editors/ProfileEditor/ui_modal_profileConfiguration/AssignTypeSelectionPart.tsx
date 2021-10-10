import { jsx, css, FC } from 'qx';
import { IProfileAssignType } from '~/shared';
import { texts } from '~/ui/base';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import { reflectValue } from '~/ui/utils';

const useAssignTypeSelectionPartViewModel = () => {
  const assignTypeOptions: IProfileAssignType[] = ['single', 'dual'];
  const currentAssignType = assignerModel.profileData.settings.assignType;
  const setAssignType = (value: string) => {
    assignerModel.changeProfileAssignType(value as IProfileAssignType);
  };
  return { assignTypeOptions, currentAssignType, setAssignType };
};

export const AssignTypeSelectionPart: FC = () => {
  const { assignTypeOptions, currentAssignType, setAssignType } =
    useAssignTypeSelectionPartViewModel();

  return (
    <div css={style}>
      <div data-hint={texts.hint_assigner_profileConfigModal_assignModel}>
        {texts.label_assigner_profileConfigModal_assignModel}
      </div>
      <div>
        <select
          value={currentAssignType}
          onChange={reflectValue(setAssignType)}
        >
          {assignTypeOptions.map((at) => (
            <option value={at} key={at}>
              {at}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const style = css`
  display: flex;
  > * + * {
    margin-left: 10px;
  }
`;
