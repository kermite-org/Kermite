import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { PageSignature } from '~ui/models/UiStatusModel';
import { ViewModels } from '~ui/viewModels';
import { CustomWindowFrame } from '~ui/views/layout/CustomWindowFrame';
import { TitleBarSection } from '../layout/TitleBarSection';
import { GlobalMenuPart } from '../navigation/GlobalMenu';
import { NavigationButtonsArea } from '../navigation/NavigationButtonsArea';
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
  presetBrowser: (_props: { vm: ViewModels }) => <PresetBrowserPage />
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

  const cssNavigationColumn = css`
    width: 50px;
    flex-shrink: 0;
    background: ${uiTheme.colors.clNavigationColumn};
    padding: 10px;
  `;

  const cssMainColumn = css`
    flex-grow: 1;
  `;

  return (
    <CustomWindowFrame
      renderTitleBar={() => <TitleBarSection vm={viewModels.titleBar} />}
    >
      <div css={cssContentRow}>
        <div css={cssNavigationColumn}>
          <GlobalMenuPart vm={viewModels.globalMenu} />
          <NavigationButtonsArea vm={viewModels.navigation} />
        </div>
        <div css={cssMainColumn}>
          <PageComponent vm={viewModels} />
        </div>
      </div>
    </CustomWindowFrame>
  );
};
