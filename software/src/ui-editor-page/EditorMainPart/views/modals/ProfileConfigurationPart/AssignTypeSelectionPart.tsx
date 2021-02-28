import { h, css } from 'qx';
import { IProfileAssignType } from '~/shared';
import { reflectValue } from '~/ui-common';
import { editorModel } from '~/ui-editor-page/EditorMainPart/models/EditorModel';

const AssignTypeSelectionPartViewModel = () => {
  const assignTypeOptions: IProfileAssignType[] = ['single', 'dual'];
  const currentAssignType = editorModel.profileData.settings.assignType;
  const setAssignType = (value: string) => {
    editorModel.changeProfileAssignType(value as IProfileAssignType);
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
    setAssignType,
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
