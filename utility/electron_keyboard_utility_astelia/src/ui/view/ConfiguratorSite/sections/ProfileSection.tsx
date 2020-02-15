import { css, jsx } from '@emotion/core';
import React, { ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { useMapDispatchToProps } from '~ui/hooks';
import { profileAsyncActions } from '~ui/state/profile';
import { AppState } from '~ui/state/store';
import { getAvailableBreedNames } from '~ui/view/WidgetSite/KeyboardShapes';

const mapDispatchToProps = (dispatch: Dispatch) => ({
  ...bindActionCreators(profileAsyncActions, dispatch)
});

export const ProfileSelection = () => {
  const { allProfileNames, currentProfileName } = useSelector(
    (state: AppState) => state.profile
  );

  const [editText, setEditText] = React.useState('');

  const {
    createProfile,
    deleteProfile,
    renameProfile,
    loadProfile,
    saveProfile
  } = useMapDispatchToProps(mapDispatchToProps);

  const breedNames = getAvailableBreedNames();
  const [currentBreedName, setCurrentBreedName] = React.useState(breedNames[0]);
  const onBreedSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentBreedName(e.currentTarget.value);
  };

  const onCreateButton = () => {
    if (editText) {
      createProfile(editText, currentBreedName);
      setEditText('');
    }
  };

  const onDeleteButton = () => {
    deleteProfile(currentProfileName);
  };

  const onRenameButton = () => {
    if (editText) {
      renameProfile(currentProfileName, editText);
      setEditText('');
    }
  };

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const profName = e.currentTarget.value;
    loadProfile(profName);
  };

  const onSaveButton = () => {
    saveProfile();
  };

  const cssProfileSelectionRow = css`
    display: flex;
    padding: 4px;
    button {
      padding: 0 4px;
    }
  `;

  return (
    <div css={cssProfileSelectionRow}>
      <div>
        <select onChange={onSelectChange} value={currentProfileName}>
          {allProfileNames.map(profName => {
            return (
              <option key={profName} value={profName}>
                {profName}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <input
          type="text"
          value={editText}
          onInput={e => setEditText(e.currentTarget.value)}
          style={{ width: '100px' }}
          onChange={() => {}}
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

      <div>
        <button onClick={onCreateButton}>+</button>
        <button onClick={onRenameButton}>cn</button>
        <button onClick={onDeleteButton}>x</button>
        <button onClick={onSaveButton}>s</button>
      </div>
    </div>
  );
};
