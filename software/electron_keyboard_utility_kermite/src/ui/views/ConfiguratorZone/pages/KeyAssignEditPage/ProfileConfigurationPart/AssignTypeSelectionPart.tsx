import { css } from 'goober';
import { h } from '~lib/qx';
import { IProfileAssignType } from '~defs/ProfileData';
import { editorModel } from '~ui/models';
import { reflectValue } from '~ui/views/base/FormHelpers';

const AssignTypeSelectionPartViewModel = () => {
  const assignTypeOptions: IProfileAssignType[] = ['single', 'dual'];
  const currentAssignType = editorModel.profileData.assignType;
  const setAssignType = (value: string) => {
    editorModel.changeProfileAssignType(value as IProfileAssignType);
  };
  return { assignTypeOptions, currentAssignType, setAssignType };
};

export const AssignTypeSelectionPart = () => {
  const cssAttrsRow = css`
    display: flex;
    > * + * {
      margin-left: 10px;
    }
  `;

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