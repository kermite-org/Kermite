import { css } from 'goober';
import { h } from '~lib/qx';
import { profilesModel, appDomain } from '~ui/models/zAppDomain';

export const LaunchButton = () => {
  const cssLaunchButton = css`
    position: relative;
    height: 22px;
    cursor: pointer;

    > .icon {
      /* opacity: 0.5; */
      font-size: 22px;
      color: #fe0;

      &:hover {
        color: #ff0;
      }
    }
    > .badge {
      position: absolute;
      top: 0px;
      left: 0px;
      font-size: 10px;
      color: #ff0;
    }
  `;

  const onClick = () => {
    profilesModel.saveProfile();
    appDomain.keyboardConfigModel.writeConfigurationToDevice();
  };

  return (
    <div css={cssLaunchButton} onClick={onClick}>
      <div class="icon">
        <i class="fa fa-rocket" />
        {/* <i className="fa fa-fighter-jet" /> */}
      </div>
      {/* <div class="badge">
        <i class="fa fa-star" />
      </div> */}
    </div>
  );
};
