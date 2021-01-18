import { uiTheme } from '~/ui-common';
import { css } from 'goober';
import { h } from 'qx';
import { models } from '~/models';
import { NavigationColumn } from '~/views/navigation/NavigationColumn';
import { WindowTitleBarSection } from '~/views/titleBar/WindowTitleBarSection';
import { CustomWindowFrame } from '~/views/windowFrame/CustomWindowFrame';

const styles = {
  cssContentRow: css`
    background: ${uiTheme.colors.clPageBackground};
    color: ${uiTheme.colors.clMainText};
    display: flex;
  `,

  cssMainColumn: css`
    flex-grow: 1;
  `,
};

export const ConfiguratorZoneRoot = () => {
  const { page } = models.uiStatusModel.settings;

  return (
    <CustomWindowFrame renderTitleBar={() => <WindowTitleBarSection />}>
      <div css={styles.cssContentRow}>
        <NavigationColumn />
        <div css={styles.cssMainColumn}>
          {/* show iframe page here */}
          {page}
          {/* {page === 'editor' && <EditorPage />}
          {page === 'shapePreview' && <KeyboardShapePreviewPage />}
          {page === 'firmwareUpdation' && <FirmwareUpdationPage />}
          {page === 'presetBrowser' && <PresetBrowserPage />}
          {page === 'heatmap' && <HeatmapPage />} */}
        </div>
      </div>
    </CustomWindowFrame>
  );
};
