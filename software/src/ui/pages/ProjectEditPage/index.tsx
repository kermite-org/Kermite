import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { pageActions } from '~/ui/commonModels';
import { projectPackagesHooks, projectPackagesWriter } from '~/ui/commonStore';
import { reflectValue } from '~/ui/helpers';

export const ProjectEditPage: FC = () => {
  const projectInfo = projectPackagesHooks.useEditTargetProject();

  const keyboardName = projectInfo.keyboardName;

  const handleKeyboardNameChange = (value: string) => {
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
  };

  const resourceData = {
    firmwares: projectInfo.firmwares.map((it) => it.variationName),
    layouts: projectInfo.layouts.map((it) => it.layoutName),
    preset: projectInfo.presets.map((it) => it.presetName),
  };

  const onLayoutEditButton = () => {
    pageActions.navigateTo({
      type: 'projectLayoutEdit',
      layoutName: projectInfo.layouts[0].layoutName,
    });
  };

  const onPresetEditButton = () => {
    pageActions.navigateTo({
      type: 'projectPresetEdit',
      presetName: projectInfo.presets[0].presetName,
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
        <button onClick={onLayoutEditButton}>edit layout</button>
        <button onClick={onPresetEditButton}>edit preset</button>
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
