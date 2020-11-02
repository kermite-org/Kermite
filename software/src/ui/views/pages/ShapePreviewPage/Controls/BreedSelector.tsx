import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/FormHelpers';
import { IBreedSelectorViewModel } from '~ui/viewModels/ShapePreviewPageViewModel';

export function BreedSelector(props: { vm: IBreedSelectorViewModel }) {
  const { allBreedNames, currentBreedName, setCurrentBreedName } = props.vm;
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
