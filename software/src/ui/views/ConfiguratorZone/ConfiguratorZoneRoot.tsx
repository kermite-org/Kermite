import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { models } from '~ui/models';
import { PageSignature } from '~ui/models/UiStatusModel';
import { viewModels } from '~ui/viewModels';
import { CustomWindowFrame } from './layout/CustomWindowFrame';
import { GlobalMenuPart } from './navigation/GlobalMenu';
import { NavigationButtonsArea } from './navigation/NavigationButtonsArea';
import { FirmwareUpdationPage } from './pages/FirmwareUpdationPage';
import { EditorPage } from './pages/KeyAssignEditPage/EditorPage';
import { KeyboardShapePreviewPage } from './pages/ShapePreviewPage/ShapePreviewPage';

const pageComponentMap: {
  [key in PageSignature]: () => JSX.Element;
} = {
  editor: EditorPage,
  shapePreview: () => <KeyboardShapePreviewPage vm={viewModels.shapePreview} />,
  firmwareUpdation: FirmwareUpdationPage
};

export const ConfiguratorZoneRoot = () => {
  const PageComponent = pageComponentMap[models.uiStatusModel.settings.page];

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
    <CustomWindowFrame>
      <div css={cssContentRow}>
        <div css={cssNavigationColumn}>
          <GlobalMenuPart />
          <NavigationButtonsArea />
        </div>
        <div css={cssMainColumn}>
          <PageComponent />
        </div>
      </div>
    </CustomWindowFrame>
  );
};
