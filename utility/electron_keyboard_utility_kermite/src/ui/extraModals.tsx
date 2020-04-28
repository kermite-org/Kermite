/* eslint-disable react/display-name */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { createModal } from './foregroundModalLayer';
import { ClosableOverlay } from './basicModals';
import { getAvailableBreedNames } from '~defs/keyboardShapes';

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

export const processCreateProfileDialog = createModal(() => {
  return (props: {
    close: (result: CreateProfileDialogResult | undefined) => void;
  }) => {
    const [profileNameText, setProfileNameText] = React.useState('');
    const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileNameText(e.currentTarget.value);
    };

    const breedNames = getAvailableBreedNames();
    const [currentBreedName, setCurrentBreedName] = React.useState(
      breedNames[0]
    );
    const onBreedSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentBreedName(e.currentTarget.value);
    };

    const onSubmitButton = () => {
      props.close({
        newProfileName: profileNameText,
        breedName: currentBreedName
      });
    };

    return (
      <ClosableOverlay close={() => props.close(undefined)}>
        <div css={cteateProfileDialogPanel} onClick={e => e.stopPropagation()}>
          <div>
            <input
              type="text"
              value={profileNameText}
              onChange={onTextChange}
            />
          </div>
          <div>
            <select value={currentBreedName} onChange={onBreedSelect}>
              {breedNames.map(breedName => (
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
