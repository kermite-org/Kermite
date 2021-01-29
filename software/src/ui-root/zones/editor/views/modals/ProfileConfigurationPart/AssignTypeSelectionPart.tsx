import { css } from 'goober';
import { h } from 'qx';
import { IProfileAssignType } from '~/shared';
import { reflectValue } from '~/ui-common';
import { models } from '~/ui-root/zones/common/commonModels';

const AssignTypeSelectionPartViewModel = () => {
  const assignTypeOptions: IProfileAssignType[] = ['single', 'dual'];
  const currentAssignType = models.editorModel.profileData.settings.assignType;
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
