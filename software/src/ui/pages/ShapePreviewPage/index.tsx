import { css, FC, jsx } from 'alumina';
import { CommonPageFrame, GeneralSelector } from '~/ui/components';
import { PreviewKeyboardShapeView } from '~/ui/elements/keyboard';
import { useShapePreviewPageModel } from '~/ui/pages/ShapePreviewPage/models';
import { ShapePreviewOptionsBox } from '~/ui/pages/ShapePreviewPage/organisms/ShapePreviewOptionsBox';

export const ShapePreviewPage: FC = () => {
  const {
    loadedDesign,
    settings,
    projectSelectorSource,
    layoutSelectorSource,
    holdKeyIndices,
  } = useShapePreviewPageModel();
  return (
    <CommonPageFrame pageTitle="Keyboard Shape Preview">
      <div css={style}>
        <div class="topRow">
          <GeneralSelector {...projectSelectorSource} width={160} />
          <GeneralSelector {...layoutSelectorSource} width={160} />
          <div class="spacer" />
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
    </CommonPageFrame>
  );
};

const style = css`
  flex-grow: 1;

  > * + * {
    margin-top: 10px;
  }

  > * {
    flex-shrink: 0;
  }

  > .topRow {
    display: flex;

    > * + * {
      margin-left: 40px;
    }

    > .spacer {
      flex-grow: 1;
    }
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
