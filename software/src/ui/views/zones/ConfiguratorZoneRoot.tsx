import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { ViewModels } from '~ui/viewModels';
import { CustomWindowFrame } from '~ui/views/base/window/CustomWindowFrame';
import { NavigationColumn } from '../base/navigation/NavigationColumn';
import { WindowTitleBarSection } from '../base/titleBar/WindowTitleBarSection';
import { FirmwareUpdationPage } from '../pages/FirmwareUpdationPage';
import { EditorPage } from '../pages/KeyAssignEditPage/EditorPage';
import { PresetBrowserPage } from '../pages/PresetBrowserPage';
import { KeyboardShapePreviewPage } from '../pages/ShapePreviewPage';

const styles = {
  cssContentRow: css`
    background: ${uiTheme.colors.clBackground};
    color: ${uiTheme.colors.clMainText};
    display: flex;
  `,

  cssMainColumn: css`
    flex-grow: 1;
  `
};

export const ConfiguratorZoneRoot = (props: { viewModels: ViewModels }) => {
  const { viewModels: vm } = props;

  const { page } = vm.models.uiStatusModel.settings;

  return (
    <CustomWindowFrame
      renderTitleBar={() => <WindowTitleBarSection vm={vm.titleBar} />}
    >
      <div css={styles.cssContentRow}>
        <NavigationColumn vm={vm} />
        <div css={styles.cssMainColumn}>
          {page === 'editor' && <EditorPage />}
          {page === 'shapePreview' && <KeyboardShapePreviewPage />}
          {page === 'firmwareUpdation' && (
            <FirmwareUpdationPage vm={vm.firmwareUpdation} />
          )}
          {page === 'presetBrowser' && <PresetBrowserPage />}
        </div>
      </div>
    </CustomWindowFrame>
  );
};
