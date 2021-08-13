import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  pageActions,
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

  const resourceData = {
    firmwares: projectInfo.customFirmwareReferences.map((it) => it.variantName),
    layouts: projectInfo.layouts.map((it) => it.layoutName),
    preset: projectInfo.profiles.map((it) => it.profileName),
  };

  const onButton = () => {
    pageActions.navigateTo({
      type: 'projectLayoutEdit',
      layoutName: projectInfo.layouts[0].layoutName,
    });
  };

  return (
    <div css={style}>
      <div>project edit page</div>
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
      <pre>{JSON.stringify(resourceData, null, ' ')}</pre>
      <div>
        <button onClick={onButton}>edit layout</button>
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;

  > * + * {
    margin-top: 10px;
  }

  input {
    margin-left: 10px;
  }

  pre {
    border: solid 1px #888;
    color: #222;
    padding: 10px;
    width: 300px;
    font-size: 14px;
  }
`;
