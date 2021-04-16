import { jsx, css } from 'qx';
import { IProfileAssignType } from '~/shared';
import { reflectValue, texts } from '~/ui/common';
import { editorModel } from '~/ui/editor-page/editorMainPart/models/EditorModel';

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
