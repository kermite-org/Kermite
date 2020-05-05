import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { makeProfileManagementViewModel } from './ProfileManagementPart.model';
import { reflectValue } from '~ui2/views/common/FormHelpers';

export const ProfileManagementPart = () => {
  const {
    currentProfileName,
    allProfileNames,
    createProfile,
    loadProfile,
    saveProfile,
    renameProfile,
    deleteProfile
  } = makeProfileManagementViewModel();

  const cssProfileSelectionRow = css`
    background: #024;
    display: flex;
    padding: 4px;
    button {
      padding: 0 4px;
    }
  `;

  return (
    <div css={cssProfileSelectionRow}>
      <div>
        <select onChange={reflectValue(loadProfile)} value={currentProfileName}>
          {allProfileNames.map((profName) => (
            <option key={profName} value={profName}>
              {profName}
            </option>
          ))}
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
