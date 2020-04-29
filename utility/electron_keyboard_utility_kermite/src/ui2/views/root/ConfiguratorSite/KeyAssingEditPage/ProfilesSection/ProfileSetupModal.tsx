import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { createModal } from '~ui2/views/basis/ForegroundModalLayer';
import { getAvailableBreedNames } from '~defs/keyboardShapes';
import { ClosableOverlay } from '~ui2/views/common/basicModals';

const cteateProfileDialogPanel = css`
  background: #fff;
  border: solid 1px #ccc;
  width: 400px;
  height: 400px;
  display: flex;
  flex-direction: column;

  .buttons-row {
    flex-grow: 0;
    padding: 5px;
    display: flex;
    justify-content: flex-end;
  }

  button {
    padding: 0 4px;
    border: solid 1px #08f;
  }
`;

interface CreateProfileDialogResult {
  newProfileName: string;
  breedName: string;
}

export function handleValue(proc: (value: string) => void) {
  return (e: Event) => {
    proc((e.currentTarget as HTMLInputElement).value);
  };
}

export const profileSetupModal = createModal(() => {
  const breedNames = getAvailableBreedNames();
  let profileNameText = '';
  let currentBreedName = breedNames[0];

  const setProfileName = (value: string) => (profileNameText = value);
  const setCurrentBreedName = (value: string) => (currentBreedName = value);

  return (props: {
    close: (result: CreateProfileDialogResult | undefined) => void;
  }) => {
    const onSubmitButton = () => {
      props.close({
        newProfileName: profileNameText,
        breedName: currentBreedName
      });
    };

    return (
      <ClosableOverlay close={() => props.close(undefined)}>
        <div
          css={cteateProfileDialogPanel}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <input
              type="text"
              value={profileNameText}
              onChange={handleValue(setProfileName)}
            />
          </div>
          <div>
            <select
              value={currentBreedName}
              onChange={handleValue(setCurrentBreedName)}
            >
              {breedNames.map((breedName) => (
                <option value={breedName} key={breedName}>
                  {breedName}
                </option>
              ))}
            </select>
          </div>

          <div className="buttons-row">
            <button onClick={onSubmitButton}>OK</button>
          </div>
        </div>
      </ClosableOverlay>
    );
  };
});
