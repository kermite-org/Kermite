import { css } from 'goober';
import { IKeyboardShape } from '~defs/ProfileData';
import { appDomain } from '~ui2/models/zAppDomain';
import { h } from '~ui2/views/basis/qx';
import {
  reflectFieldChecked,
  reflectValue
} from '~ui2/views/common/FormHelpers';
import { KeyboardShapeView } from './KeyboardShapeView';
import { IUiSettings } from '~ui2/models/UiStatusModel';
import { appUi } from '~ui2/models/appGlobal';

class ShapePreviewPageModel {
  loadedBreedName: string = '';
  loadedShape: IKeyboardShape | undefined;

  get settings(): IUiSettings {
    return appDomain.uiStatusModel.settings;
  }

  get allBreedNames(): string[] {
    return appDomain.keyboardShapesModel.getAllBreedNames();
  }

  get currentBreedName(): string {
    return (
      appDomain.uiStatusModel.settings.shapeViewBreedName ||
      this.allBreedNames[0]
    );
  }

  setCurrentBreedName = async (breedName: string) => {
    appDomain.uiStatusModel.settings.shapeViewBreedName = breedName;
    if (breedName !== this.loadedBreedName) {
      this.loadShape(breedName);
    }
  };

  private async loadShape(nextBreedName: string) {
    this.loadedBreedName = nextBreedName;
    this.loadedShape = await appDomain.keyboardShapesModel.getKeyboardShapeByBreedName(
      nextBreedName
    );
    appUi.rerender();
    //todo: バックエンドでレイアウト定義ファイルの変更を監視して, コードの変更を表示に反映する
  }

  initialize() {
    this.loadShape(this.currentBreedName);
  }
}

function BreedSelector(props: {
  allBreedNames: string[];
  currentBreedName: string;
  setCurrentBreedName(breedName: string): void;
}) {
  const { allBreedNames, currentBreedName, setCurrentBreedName } = props;
  return (
    <select
      value={currentBreedName}
      onChange={reflectValue(setCurrentBreedName)}
      style={{ minWidth: '100px' }}
    >
      {allBreedNames.map((breedName) => (
        <option value={breedName} key={breedName}>
          {breedName}
        </option>
      ))}
    </select>
  );
}

interface IDisplayOptionSource {
  fieldKey: keyof IUiSettings;
  label: string;
}
const displayOptionsSource: IDisplayOptionSource[] = [
  {
    fieldKey: 'shapeViewShowKeyId',
    label: 'keyId'
  },
  {
    fieldKey: 'shapeViewShowKeyIndex',
    label: 'keyId'
  },
  {
    fieldKey: 'shapeViewShowBoundingBox',
    label: 'box'
  }
];

function OptionsBox(props: { settings: IUiSettings }) {
  const cssOptionsBox = css`
    display: flex;
    align-items: center;
    > * + * {
      margin-left: 10px;
    }

    > div {
      > label {
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;

        > span {
          display: inline-block;
          margin-left: 2px;
        }
      }
    }
  `;

  const { settings } = props;

  return (
    <div css={cssOptionsBox}>
      {displayOptionsSource.map((om) => (
        <div key={om.fieldKey}>
          <label>
            <input
              type="checkbox"
              checked={settings[om.fieldKey] as boolean}
              onChange={reflectFieldChecked(settings, om.fieldKey)}
            />
            <span>{om.label}</span>
          </label>
        </div>
      ))}
    </div>
  );
}

export const KeyboardShapePreviewPage = () => {
  const model = new ShapePreviewPageModel();

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

  return {
    didMount() {
      model.initialize();
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
            <OptionsBox settings={settings} />
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
