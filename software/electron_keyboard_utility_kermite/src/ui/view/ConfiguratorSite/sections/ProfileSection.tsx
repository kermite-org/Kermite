import { css, jsx } from '@emotion/core';
import { ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { useMapDispatchToProps } from '~ui/hooks';
import { profileAsyncActions } from '~ui/state/profile';
import { AppState } from '~ui/state/store';

const mapDispatchToProps = (dispatch: Dispatch) => ({
  ...bindActionCreators(profileAsyncActions, dispatch)
});

export const ProfileSelection = () => {
  const { allProfileNames, currentProfileName } = useSelector(
    (state: AppState) => state.profile
  );

  const {
    createProfile,
    deleteProfile,
    renameProfile,
    loadProfile,
    saveProfile
  } = useMapDispatchToProps(mapDispatchToProps);

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const profName = e.currentTarget.value;
    loadProfile(profName);
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
          {allProfileNames.map((profName) => {
            return (
              <option key={profName} value={profName}>
                {profName}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <button onClick={createProfile}>new</button>
        <button onClick={renameProfile}>rename</button>
        <button onClick={deleteProfile}>delete</button>
        <button onClick={saveProfile}>save</button>
      </div>
    </div>
  );
};
