import { css, FC, jsx, useMemo } from 'qx';
import { fallbackProjectPackageInfo } from '~/shared';
import { uiTheme } from '~/ui/base';
import { projectPackagesReader } from '~/ui/commonModels';

export const ProjectEditPage: FC = () => {
  const projectInfo =
    useMemo(projectPackagesReader.getEditTargetProject, []) ||
    fallbackProjectPackageInfo;
  console.log({ projectInfo });

  const keyboardName = projectInfo.keyboardName;

  const onChange = (e: Event) => {
    const text = (e.currentTarget as HTMLInputElement).value;
    projectInfo.keyboardName = text;
  };

  return (
    <div css={style}>
      project edit page
      <div>
        <label>
          <span>keyboard name</span>
          <input type="text" value={keyboardName} onChange={onChange} />
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
