import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { useProjectResourceInfosBasedOnGlobalSettings } from '~/ui/commonModels';
import { globalSettingsModel } from '~/ui/commonModels/GlobalSettingsModel';
import { FlatListSelector } from '~/ui/components';

export const ProjectSelectionPage: FC = () => {
  const resourceInfos = useProjectResourceInfosBasedOnGlobalSettings();
  const options = resourceInfos.map((info) => ({
    label: info.keyboardName,
    value: info.projectId,
  }));
  options.unshift({ value: '', label: 'none' });
  const { globalProjectId } = globalSettingsModel.globalSettings;
  const setGlobalProjectId = (id: string) => {
    globalSettingsModel.writeValue('globalProjectId', id);
  };

  return (
    <div css={style}>
      Global Project Selection
      <div>
        <FlatListSelector
          options={options}
          value={globalProjectId}
          setValue={setGlobalProjectId}
          size={10}
        />
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;
  position: relative;
`;
