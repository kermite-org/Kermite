import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { GeneralSelector } from '~/ui/components';
import { PreviewKeyboardShapeView } from '~/ui/components/keyboard';
import { useShapePreviewPageModel } from '~/ui/pages/shape-preview-page/models';
import { ShapePreviewOptionsBox } from '~/ui/pages/shape-preview-page/organisms/ShapePreviewOptionsBox';

export const ShapePreviewPage: FC = () => {
  const {
    loadedDesign,
    settings,
    projectSelectorSource,
    layoutSelectorSource,
    holdKeyIndices,
  } = useShapePreviewPageModel();
  return (
    <div css={style}>
      <div>keyboard shape preview</div>
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
  );
};

const style = css`
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
