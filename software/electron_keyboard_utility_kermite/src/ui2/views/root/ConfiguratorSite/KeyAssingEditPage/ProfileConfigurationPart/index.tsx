import { hx } from '~ui2/views/basis/qx';
import { IProfileAssignType } from '~defs/ProfileData';
import { editorModel } from '~ui2/models/zAppDomain';
import { css } from 'goober';
import { reflectValue } from '~ui2/views/common/FormHelpers';

const makeProfileConfigurationPartModel = () => {
  const assignTypeOptions: IProfileAssignType[] = ['single', 'dual'];

  const currentAssignType = editorModel.profileData.assignType;

  const setAssignType = (value: string) => {
    editorModel.changeProfileAssignType(value as IProfileAssignType);
  };

  return { assignTypeOptions, currentAssignType, setAssignType };
};

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  const cssAttrsRow = css`
    display: flex;
  `;

  const {
    assignTypeOptions,
    currentAssignType,
    setAssignType
  } = makeProfileConfigurationPartModel();

  return (
    <div css={cssBase}>
      <div>profile settings</div>
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
    </div>
  );
};
