import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { profilesModel, editorModel } from '~ui2/models/zAppDomain';
import { sendIpcPacket } from '~ui2/models/dataSource/ipc';

const LaunchButton = () => {
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
    // sendIpcPacket({ writeKeymappingToDevice: true });
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

const LinkIndicator = () => {
  const cssLinkIndicator = css`
    color: #0df;
  `;

  return (
    <div css={cssLinkIndicator}>
      <i class="fa fa-link" />
    </div>
  );
};

const BehaviorSelector = () => {
  return (
    <div>
      <div>STD</div>
    </div>
  );
};

const LangSelector = () => {
  const cssLangSelector = css`
    width: 20px;
    user-select: none;
    > .current {
      &:hover {
        display: none;
      }
    }

    > .selectable {
      cursor: pointer;

      > div:first-of-type {
        opacity: 0.5;
      }
    }
  `;

  let isHover = false;
  const onMouseEnter = () => (isHover = true);
  const onMouseLeave = () => (isHover = false);

  return () => (
    <div
      css={cssLangSelector}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!isHover && <div class="current">JP</div>}
      {isHover && (
        <div class="selectable">
          <div>US</div>
          <div>JP</div>
        </div>
      )}
    </div>
  );
};

export const DeviceControlSection = () => {
  const cssDeviceControlSection = css`
    /* border: solid 2px #f80; */
    display: flex;
    align-items: center;
    > * {
      margin-right: 15px;
    }
  `;

  return (
    <div css={cssDeviceControlSection}>
      <LaunchButton />
      <BehaviorSelector />
      <LangSelector />
      <LinkIndicator />
    </div>
  );
};
