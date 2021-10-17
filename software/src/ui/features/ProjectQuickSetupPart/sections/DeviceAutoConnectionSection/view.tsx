import { css, FC, jsx } from 'qx';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionFrame';
import { useDeviceAutoConnectionSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/DeviceAutoConnectionSection/model';

export const DeviceAutoConnectionSection: FC = () => {
  const { isConnectionValid, isCommunicationIndicatorActive } =
    useDeviceAutoConnectionSectionModel();

  return (
    <SectionFrame title="Device Connection">
      <div class={style}>
        <div>connection status: {isConnectionValid ? 'ok' : 'ng'}</div>
        <div className="indicators">
          <div classNames={['indicator', isConnectionValid && '--active']} />
          <div
            classNames={[
              'indicator',
              isCommunicationIndicatorActive && '--active',
            ]}
          />
        </div>
      </div>
    </SectionFrame>
  );
};

const style = css`
  > .indicators {
    display: flex;
    flex-direction: column;
    gap: 2px;
    > .indicator {
      width: 10px;
      height: 10px;
      border: solid 1px #0a0;
      border-radius: 50%;
      background: #ccc;
      &.--active {
        background: #0f0;
      }
      transition: all 0.1s;
    }
  }
`;
