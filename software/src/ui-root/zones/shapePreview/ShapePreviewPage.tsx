import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { GeneralSelector } from '~/ui-common/parts/controls/GeneralSelector';
import { ShapePreviewOptionsBox } from '~/ui-root/zones/common/parts/fabrics/ShapePreviewOptionsBox';
import { PreviewKeyboardShapeView } from '~/ui-root/zones/common/parts/keyboardSvg/panels/PreviewKeyboardShapeView';
import { makeShapePreviewPageViewModel } from '~/ui-root/zones/shapePreview/ShapePreviewPageViewModel';

const cssShapePreviewPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;
  > * + * {
    margin-top: 5px;
  }

  display: flex;
  flex-direction: column;

  > * {
    flex-shrink: 0;
  }

  > .topRow {
    display: flex;
    justify-content: space-between;
  }

  > .keyboardRow {
    flex-shrink: 1;
    flex-grow: 1;
    height: 50%;
  }

  > .restRow {
    flex-shrink: 1;
    flex-grow: 1;
    height: 50%;
  }
`;

export const KeyboardShapePreviewPage = () => {
  const vm = makeShapePreviewPageViewModel();
  const {
    loadedDesign,
    settings,
    projectSelectorSource,
    layoutSelectorSource,
    holdKeyIndices,
  } = vm;
  return (
    <div css={cssShapePreviewPage}>
      <div>keyboard shape preview</div>
      <div class="topRow">
        <GeneralSelector {...projectSelectorSource} width={160} />
        <GeneralSelector {...layoutSelectorSource} width={160} />
        <ShapePreviewOptionsBox settings={settings} />
      </div>
      <div class="keyboardRow">
        {loadedDesign && (
          <PreviewKeyboardShapeView
            keyboardDesign={loadedDesign}
            settings={settings}
          />
        )}
      </div>
      <div class="restRow">
        hold key indices: {JSON.stringify(holdKeyIndices)}
      </div>
    </div>
  );
};
