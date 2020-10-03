import { css } from 'goober';
import { h } from '~lib/qx';
import { BreedSelector } from './Controls/BreedSelector';
import { PreviewOptionsBox } from './Controls/PreviewOptionsBox';
import { ShapePreviewPageModel } from './ShapePreviewPage.model';
import { KeyboardShapeView } from './ShapeView/KeyboardShapeView';

const cssShapePreviewPage = css`
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
  const model = new ShapePreviewPageModel();

  return {
    didMount() {
      model.initialize();
    },
    willUnmount() {
      model.finalize();
    },
    render() {
      const {
        loadedShape,
        allBreedNames,
        currentBreedName,
        setCurrentBreedName,
        settings
      } = model;
      return (
        <div css={cssShapePreviewPage}>
          <div>keyboard shape preview</div>
          <div class="topRow">
            <BreedSelector
              allBreedNames={allBreedNames}
              currentBreedName={currentBreedName}
              setCurrentBreedName={setCurrentBreedName}
            />
            <PreviewOptionsBox settings={settings} />
          </div>
          <div class="keyboardRow">
            {loadedShape && <KeyboardShapeView shape={loadedShape} />}
          </div>
          <div class="restRow"></div>
        </div>
      );
    }
  };
};
