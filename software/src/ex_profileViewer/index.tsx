import { applyGlobalStyle, css, FC, jsx, render, rerender } from 'alumina';
import { KmsPresetKeyboardSection } from '~/ex_profileViewer/KmsPresetKeyboardSection';
import { kmsColors } from '~/ex_profileViewer/kmsColors';
import {
  debounce,
  fallbackProfileData,
  IPersistProfileData,
  IProfileData,
  ProfileDataConverter,
} from '~/shared';
import { ProfileDataMigrator } from '~/shell/loaders/profileDataMigrator';
import { ScalerBox } from '~/ui/elements';
import { usePresetKeyboardSectionModel } from '~/ui/fabrics/presetKeyboardSection/model';

const globalCss = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
  }

  body {
    overflow: hidden;
  }

  #app {
    font-family: 'Roboto', sans-serif;
    background: ${kmsColors.pageBackground};
    color: ${kmsColors.pageText};
  }
`;

interface IProfileResponse {
  data: string;
  id: string;
  name: string;
  projectId: string;
  userDisplayName: string;
  description: string;
  lastUpdate: string;
}

const state = new (class {
  error: string = '';
  loadedProfile: IProfileData = fallbackProfileData;
})();

async function fetchProfile() {
  const params = new URLSearchParams(location.search);
  const profileId = params.get('profileId');
  const debugProfileUrl = params.get('debugProfileUrl');

  if (debugProfileUrl) {
    // fetch raw profile
    try {
      console.log(`loading profile from ${debugProfileUrl}`);
      const res = await fetch(debugProfileUrl);
      const sourceProfileData = (await res.json()) as IPersistProfileData;
      const migratedProfileData =
        ProfileDataMigrator.fixProfileData(sourceProfileData);
      const profileData =
        ProfileDataConverter.convertProfileDataFromPersist(migratedProfileData);
      console.log(`profile loaded`);
      // console.log({ profileData });
      state.loadedProfile = profileData;
    } catch (err) {
      console.error(err);
      state.error = 'failed to fetch data';
    }
  } else if (profileId) {
    // fetch profile from kermite server
    const profileUrl = `https://server.kermite.org/api/profiles/${profileId}`;
    try {
      console.log(`loading profile from ${profileUrl}`);
      const res = await fetch(profileUrl);
      const obj = (await res.json()) as IProfileResponse;
      const sourceProfileData = JSON.parse(obj.data);
      const migratedProfileData =
        ProfileDataMigrator.fixProfileData(sourceProfileData);
      const profileData =
        ProfileDataConverter.convertProfileDataFromPersist(migratedProfileData);
      console.log(`profile loaded: ${obj.name} (by ${obj.userDisplayName})`);
      // console.log({ profileData });
      state.loadedProfile = profileData;
    } catch (err) {
      console.error(err);
      state.error = 'failed to fetch data';
    }
  } else {
    state.error = 'no profilleId search parameter in url';
    return;
  }
  rerender();
}

const ProfileViewContentRoot: FC = () => {
  const presetKeyboardSectionViewModel = usePresetKeyboardSectionModel(
    state.loadedProfile,
  );

  const cssBase = css`
    > .errorText {
      margin: 10px;
    }
    > .presetKeyboardSection {
      height: 400px;
    }
  `;
  return (
    <ScalerBox contentWidth={800} contentHeight={400}>
      <div class={cssBase}>
        <div if={!!state.error} className="errorText">
          {state.error}
        </div>
        <KmsPresetKeyboardSection
          viewModel={presetKeyboardSectionViewModel}
          className="presetKeyboardSection"
          if={!state.error}
        />
      </div>
    </ScalerBox>
  );
};

const PageRoot: FC = () => {
  const cssPageRoot = css`
    height: 100%;

    > .rootPanel {
      width: 100%;
      aspect-ratio: 2;
    }
  `;

  return (
    <div class={cssPageRoot}>
      <div class="rootPanel">
        <ProfileViewContentRoot />
      </div>
    </div>
  );
};

window.addEventListener('load', () => {
  console.log('profile viewer 210625g');
  applyGlobalStyle(globalCss);
  const appDiv = document.getElementById('app');
  render(() => <PageRoot />, appDiv);
  window.addEventListener('resize', debounce(rerender, 100));

  fetchProfile();
});
