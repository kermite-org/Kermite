import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { PageSignature } from '~ui/models/UiStatusModel';
import { ViewModels } from '~ui/viewModels';
import { CustomWindowFrame } from '~ui/views/base/window/CustomWindowFrame';
import { NavigationColumn } from '../base/navigation/NavigationColumn';
import { WindowTitleBarSection } from '../base/titleBar/WindowTitleBarSection';
import { FirmwareUpdationPage } from '../pages/FirmwareUpdationPage';
import { EditorPage } from '../pages/KeyAssignEditPage/EditorPage';
import { PresetBrowserPage } from '../pages/PresetBrowserPage';
import { KeyboardShapePreviewPage } from '../pages/ShapePreviewPage';

const pageComponentMap: {
  [key in PageSignature]: (props: { vm: ViewModels }) => JSX.Element;
} = {
  editor: () => <EditorPage />,
  shapePreview: (props: { vm: ViewModels }) => (
    <KeyboardShapePreviewPage vm={props.vm.shapePreview} />
  ),
  firmwareUpdation: (props: { vm: ViewModels }) => (
    <FirmwareUpdationPage vm={props.vm.firmwareUpdation} />
  ),
  presetBrowser: (props: { vm: ViewModels }) => (
    <PresetBrowserPage vm={props.vm.presetBrowser} />
  )
};

export const ConfiguratorZoneRoot = (props: { viewModels: ViewModels }) => {
  const { viewModels } = props;

  const PageComponent =
    pageComponentMap[viewModels.models.uiStatusModel.settings.page];

  const cssContentRow = css`
    background: ${uiTheme.colors.clBackground};
    color: ${uiTheme.colors.clMainText};
    display: flex;
  `;

  const cssMainColumn = css`
    flex-grow: 1;
  `;

  return (
    <CustomWindowFrame
      renderTitleBar={() => <WindowTitleBarSection vm={viewModels.titleBar} />}
    >
      <div css={cssContentRow}>
        <NavigationColumn vm={viewModels} />
        <div css={cssMainColumn}>
          <PageComponent vm={viewModels} />
        </div>
      </div>
    </CustomWindowFrame>
  );
};
