import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { getAvailableBreedNames } from '~defs/keyboardShapes';
import { reflectFieldValue } from '~ui2/views/common/FormHelpers';
import { appDomain } from '~ui2/models/zAppDomain';
import { backendAgent } from '~ui2/models/dataSource/ipc';
import { IKeyboardShape } from '~defs/ProfileData';
import { appUi } from '~ui2/models/appGlobal';

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

export const KeyboardShapePreviewPage = () => {
  const cssBase = css`
    padding: 10px;
  `;

  let curBreedName = '';
  let loadedShape: IKeyboardShape | undefined;

  function updateModel() {
    const breedName = appDomain.uiStatusModel.settings.shapeViewBreedName;
    if (breedName !== curBreedName) {
      curBreedName = breedName;
      backendAgent.getKeyboardShape(breedName).then((shape) => {
        loadedShape = shape;
        appUi.rerender();
      });
    }
  }

  return () => {
    updateModel();
    return (
      <div css={cssBase}>
        <div>keyboard shape preview</div>
        <BreedSelector />
        <div>{loadedShape && JSON.stringify(loadedShape)}</div>
      </div>
    );
  };
};
