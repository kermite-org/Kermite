import { css } from 'goober';
import { h } from '~lib/qx';
import { CustomWindowFrame } from './WindowFrame/CustomWindowFrame';
import { GlobalMenuPart } from './GlobalMenu';
import { KeyboardShapePreviewPage } from './ShapePreviewPage/ShapePreviewPage';
import { uiTheme } from '~ui/models/UiTheme';
import { PageSignature } from '~ui/models/UiStatusModel';
import { FirmwareUpdationPage } from './FirmwareUpdationPage';
import { EditorPage } from './KeyAssignEditPage/EditorPage';
import { NavigationButtonsArea } from './NavigationButtonsArea';
import { uiStatusModel } from '~ui/models';

function getPageComponent(pageSig: PageSignature): () => JSX.Element {
  const pageComponentMap: {
    [key in PageSignature]: () => JSX.Element;
  } = {
    editor: EditorPage,
    shapePreview: KeyboardShapePreviewPage,
    firmwareUpdation: FirmwareUpdationPage
  };
  return pageComponentMap[pageSig];
}

export const ConfiguratorViewRoot = () => {
  const PageComponent = getPageComponent(uiStatusModel.settings.page);

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
