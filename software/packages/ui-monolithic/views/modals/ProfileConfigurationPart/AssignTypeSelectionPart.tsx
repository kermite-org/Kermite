import { css } from 'goober';
import { IProfileAssignType } from '~shared/defs/ProfileData';
import { reflectValue } from '~ui/base/helper/FormHelpers';
import { models } from '~ui/models';
import { h } from '~qx';

const AssignTypeSelectionPartViewModel = () => {
  const assignTypeOptions: IProfileAssignType[] = ['single', 'dual'];
  const currentAssignType = models.editorModel.profileData.assignType;
  const setAssignType = (value: string) => {
    models.editorModel.changeProfileAssignType(value as IProfileAssignType);
  };
  return { assignTypeOptions, currentAssignType, setAssignType };
};

const cssAttrsRow = css`
  display: flex;
  > * + * {
    margin-left: 10px;
  }
`;

export const AssignTypeSelectionPart = () => {
  const {
    assignTypeOptions,
    currentAssignType,
    setAssignType
  } = AssignTypeSelectionPartViewModel();

  return (
    <div css={cssAttrsRow}>
      <div>assign model</div>
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
