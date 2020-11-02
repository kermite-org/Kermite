import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/FormHelpers';

export function BreedSelector(props: {
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
