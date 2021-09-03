import { css, FC, jsx, useMemo } from 'qx';
import { IKermiteStandardKeyboardSpec } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectFirmwareEdit } from '~/ui/commonModels';
import { uiActions, uiReaders } from '~/ui/commonStore';
import { StandardFirmwareEditor } from '~/ui/features/StandardFirmwareEditor/StandardFirmwareEditor';

type Props = {
  spec: IPageSpec_ProjectFirmwareEdit;
};

export const ProjectFirmwareEditPage: FC<Props> = ({
  spec: { firmwareName },
}) => {
  const firmwareConfig = useMemo(() => {
    const projectInfo = uiReaders.editTargetProject;
    const entry = projectInfo?.firmwares.find(
      (it) => it.variationName === firmwareName,
    );
    if (entry?.type === 'standard') {
      return entry.standardFirmwareConfig;
    }
    return undefined;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveHandler = (newConfig: IKermiteStandardKeyboardSpec) => {
    // projectPackagesWriter.saveLocalProjectStandardFirmware(
    //   firmwareName,
    //   newConfig,
    // );
    console.log('save firmware here');
  };

  return (
    <div css={style}>
      <div>
        <button onClick={() => uiActions.navigateTo('/projectEdit')}>
          &lt;-back
        </button>
        project firmware edit page {firmwareName}
      </div>
      <StandardFirmwareEditor
        firmwareConfig={firmwareConfig}
        saveHandler={saveHandler}
      />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;
`;
