import { IProfileManagerStatus, overwriteObjectProps } from '@kermite/shared';
import { ipcAgent, reflectValue } from '@kermite/ui';
import { css } from 'goober';
import { h, Hook } from 'qx';

const status: IProfileManagerStatus = {
  currentProfileName: '',
  allProfileNames: [],
  loadedProfileData: undefined,
  errorMessage: '',
};

const cssJsonDiv = css`
  font-size: 3px;
`;

export const ProfileSelector = () => {
  Hook.useEffect(() => {
    return ipcAgent.subscribe(
      'profile_profileManagerStatus',
      (newStatusPartial) => overwriteObjectProps(status, newStatusPartial),
    );
  }, []);

  // Hook.useEffect(() => {
  //   return ipcAgent.subscribe('profile_currentProfile', (prof) =>
  //     console.log({ prof }),
  //   );
  // }, []);

  const onSelectionChange = (selName: string) => {
    ipcAgent.async.profile_executeProfileManagerCommands([
      { loadProfile: { name: selName } },
    ]);
  };
  return (
    <div>
      <select
        value={status.currentProfileName}
        onChange={reflectValue(onSelectionChange)}
      >
        {status.allProfileNames.map((profName) => (
          <option key={profName} value={profName}>
            {profName}
          </option>
        ))}
      </select>
      <div>{status.currentProfileName}</div>
      <div css={cssJsonDiv}>{JSON.stringify(status.loadedProfileData)}</div>
    </div>
  );
};
