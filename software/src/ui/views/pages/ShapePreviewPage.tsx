import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { makeShapePreviewPageViewModel } from '~ui/viewModels/ShapePreviewPageViewModel';
import { GeneralSelector } from '~ui/views/controls/GeneralSelector';
import { ShapePreviewOptionsBox } from '~ui/views/fabrics/ShapePreviewOptionsBox';
import { PreviewKeyboardShapeView } from '~ui/views/keyboardSvg/panels/PreviewKeyboardShapeView';

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
  const { loadedShape, settings, projectSelectorSource, holdKeyIndices } = vm;
  return (
    <div css={cssShapePreviewPage}>
      <div>keyboard shape preview</div>
      <div class="topRow">
        <GeneralSelector {...projectSelectorSource} width={160} />
        <ShapePreviewOptionsBox settings={settings} />
      </div>
      <div class="keyboardRow">
        {loadedShape && (
          <PreviewKeyboardShapeView shape={loadedShape} settings={settings} />
        )}
      </div>
      <div class="restRow">
        hold key indices: {JSON.stringify(holdKeyIndices)}
      </div>
    </div>
  );
};
