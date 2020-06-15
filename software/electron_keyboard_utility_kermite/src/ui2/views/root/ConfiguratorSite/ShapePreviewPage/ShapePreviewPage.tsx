import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { getAvailableBreedNames } from '~defs/keyboardShapes';
import { reflectFieldValue } from '~ui2/views/common/FormHelpers';
import { appDomain } from '~ui2/models/zAppDomain';
import { backendAgent } from '~ui2/models/dataSource/ipc';
import { IKeyboardShape } from '~defs/ProfileData';
import { appUi } from '~ui2/models/appGlobal';
import { KeyboardShapeView } from './KeyboardShapeView';

function BreedSelector() {
  const breedNames = getAvailableBreedNames();
  const settings = appDomain.uiStatusModel.settings;
  const currentBreedName = settings.shapeViewBreedName || breedNames[0];

  return () => (
    <select
      value={currentBreedName}
      onChange={reflectFieldValue(settings, 'shapeViewBreedName')}
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
      backendAgent.getKeyboardShape(breedName).then((shape) => {
        loadedShape = shape;
        appUi.rerender();
      });
    }
    return loadedShape;
  };
}

export const KeyboardShapePreviewPage = () => {
  const cssBase = css`
    padding: 10px;
    > * + * {
      margin-top: 5px;
    }
  `;

  const shapeLoader = makeShapeLoader();

  return () => {
    const breedName = appDomain.uiStatusModel.settings.shapeViewBreedName;
    const loadedShape = shapeLoader(breedName);
    return (
      <div css={cssBase}>
        <div>keyboard shape preview</div>
        <BreedSelector />
        {loadedShape && <KeyboardShapeView shape={loadedShape} />}
      </div>
    );
  };
};
