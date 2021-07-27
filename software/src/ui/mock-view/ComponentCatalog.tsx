import { css, jsx, useEffect, useLocal } from 'qx';
import { fieldSetter, FlatListSelector } from '~/ui/common';
import { GeneralButtonExamples } from '~/ui/common/components/atoms/GeneralButton.visual';
import { GeneralSelectorExamples } from '~/ui/common/components/atoms/GeneralSelector.visual';

const cssRoot = css`
  height: 100%;
  display: flex;

  > .selection-area {
    width: 200px;
    flex-shrink: 0;
    background: #ccc;
    padding: 15px;

    h3 {
      font-size: 18px;
    }

    > .visual-selector {
      margin-top: 5px;
      width: 100%;
      outline: none;
    }
  }

  > .preview-area {
    flex-grow: 1;
    background: #f0f0f0;
    padding: 20px;

    > .preview-content {
      > * + * {
        margin-top: 20px;
      }
      > .row {
        display: flex;
      }
    }
  }
`;

const visualSource = {
  GeneralButtonExamples,
  GeneralSelectorExamples,
};

type VisualKey = keyof typeof visualSource;

const visualOptions = Object.keys(visualSource).map((it) => ({
  value: it,
  label: it.replace(/Examples$/, ''),
}));

export const ComponentCatalogPage = () => {
  const local = useLocal({
    selectedVisualKey: '',
  });

  const currentVisual =
    visualSource[(local.selectedVisualKey as VisualKey) || ''];

  useEffect(() => {
    const storageKey = 'component-catalog-selected-compoent-key';
    const key = localStorage.getItem(storageKey);
    if (key) {
      local.selectedVisualKey = key;
    }
    return () => localStorage.setItem(storageKey, local.selectedVisualKey);
  }, []);

  return (
    <div css={cssRoot}>
      <div className="selection-area">
        <h3>Components</h3>
        <FlatListSelector
          className="visual-selector"
          options={visualOptions}
          value={local.selectedVisualKey}
          setValue={fieldSetter(local, 'selectedVisualKey')}
          size={30}
        />
      </div>
      <div className="preview-area">
        {currentVisual && (
          <div className={'preview-content'}>
            {Object.entries(currentVisual).map(([key, value]) => (
              <div className="row" key={key}>
                {value}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
