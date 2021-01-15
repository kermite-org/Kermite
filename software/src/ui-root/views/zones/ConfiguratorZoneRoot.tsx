import { uiTheme } from '@ui-common';
import { UiLayouterCore } from '@ui-layouter';
import { css } from 'goober';
import { h } from 'qx';
import { models } from '~/models';
import { CustomWindowFrame } from '~/views/base/window/CustomWindowFrame';
import { HeatmapPage } from '~/views/pages/HeatmapPage';
import { NavigationColumn } from '../base/navigation/NavigationColumn';
import { WindowTitleBarSection } from '../base/titleBar/WindowTitleBarSection';
import { EditorPage } from '../pages/EditorPage';
import { FirmwareUpdationPage } from '../pages/FirmwareUpdationPage';
import { PresetBrowserPage } from '../pages/PresetBrowserPage';
import { KeyboardShapePreviewPage } from '../pages/ShapePreviewPage';

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
          {page === 'editor' && <EditorPage />}
          {page === 'layouter' && <UiLayouterCore.Component />}
          {page === 'shapePreview' && <KeyboardShapePreviewPage />}
          {page === 'firmwareUpdation' && <FirmwareUpdationPage />}
          {page === 'presetBrowser' && <PresetBrowserPage />}
          {page === 'heatmap' && <HeatmapPage />}
        </div>
      </div>
    </CustomWindowFrame>
  );
};
