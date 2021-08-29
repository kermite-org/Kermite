import { jsx, css, FC } from 'qx';
import { IProfileAssignType } from '~/shared';
import { texts } from '~/ui/base';
import { reflectValue } from '~/ui/helpers';
import { editorModel } from '~/ui/pages/editor-core/models/EditorModel';

const AssignTypeSelectionPartViewModel = () => {
  const assignTypeOptions: IProfileAssignType[] = ['single', 'dual'];
  const currentAssignType = editorModel.profileData.settings.assignType;
  const setAssignType = (value: string) => {
    editorModel.changeProfileAssignType(value as IProfileAssignType);
  };
  return { assignTypeOptions, currentAssignType, setAssignType };
};

export const AssignTypeSelectionPart: FC = () => {
  const { assignTypeOptions, currentAssignType, setAssignType } =
    AssignTypeSelectionPartViewModel();

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
