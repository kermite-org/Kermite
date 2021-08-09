import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  projectPackagesHooks,
  projectPackagesMutations,
} from '~/ui/commonModels';
import { reflectValue } from '~/ui/helpers';

export const ProjectEditPage: FC = () => {
  const projectInfo = projectPackagesHooks.useEditTargetProject();

  const keyboardName = projectInfo.keyboardName;

  const handleKeyboardNameChange = (value: string) => {
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesMutations.saveLocalProject(newProjectInfo);
  };

  return (
    <div css={style}>
      project edit page
      <div>
        <label>
          <span>keyboard name</span>
          <input
            type="text"
            value={keyboardName}
            onChange={reflectValue(handleKeyboardNameChange)}
          />
        </label>
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;
`;
