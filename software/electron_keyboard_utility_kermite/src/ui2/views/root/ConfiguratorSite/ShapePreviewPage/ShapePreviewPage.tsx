import { css } from 'goober';
import {
  getAvailableBreedNames,
  getKeyboardShapeByBreedName
} from '~defs/keyboardShapes';
import { IKeyboardShape } from '~defs/ProfileData';
import { appDomain } from '~ui2/models/zAppDomain';
import { h } from '~ui2/views/basis/qx';
import { reflectFieldValue } from '~ui2/views/common/FormHelpers';
import { KeyboardShapeView } from './KeyboardShapeView';

function BreedSelector() {
  const breedNames = getAvailableBreedNames();
  const settings = appDomain.uiStatusModel.settings;
  const currentBreedName = settings.shapeViewBreedName || breedNames[0];

  return () => (
    <select
      value={currentBreedName}
      onChange={reflectFieldValue(settings, 'shapeViewBreedName')}
      style={{ minWidth: '100px' }}
    >
      {breedNames.map((breedName) => (
        <option value={breedName} key={breedName}>
          {breedName}
        </option>
      ))}
    </select>
  );
}

function makeShapeLoader() {
  let loadedBreedName = '';
  let loadedShape: IKeyboardShape | undefined;

  return (breedName: string) => {
    if (breedName !== loadedBreedName) {
      loadedBreedName = breedName;
      //RPC経由でバックエンドからKeyboardShapeを取得した場合, ソースコードの変更を反映できない
      // backendAgent.getKeyboardShape(breedName).then((shape) => {
      //   loadedShape = shape;
      //   appUi.rerender();
      // });
      //KeyboardShapeの定義を直接参照
      loadedShape = getKeyboardShapeByBreedName(breedName);
    }
    return loadedShape;
  };
}

const cssBase = css`
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
  const shapeLoader = makeShapeLoader();

  return () => {
    const breedName = appDomain.uiStatusModel.settings.shapeViewBreedName;
    const loadedShape = shapeLoader(breedName);
    return (
      <div css={cssBase}>
        <div>keyboard shape preview</div>
        <div>
          <BreedSelector />
        </div>
        <div className="keyboardRow">
          {loadedShape && <KeyboardShapeView shape={loadedShape} />}
        </div>
        <div className="restRow"></div>
      </div>
    );
  };
};
