import { css, FC, jsx } from 'qx';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import {
  useDeviceAutoConnectionAutoConnectFunction,
  useDeviceAutoConnectionConnectionStatus,
  useDeviceKeyEventIndicatorModel,
} from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupHooks';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

type IDeviceAutoConnectionSectionModel = {
  isConnectionValid: boolean;
  isCommunicationIndicatorActive: boolean;
};

function useDeviceAutoConnectionSectionModel(): IDeviceAutoConnectionSectionModel {
  const { projectId } = projectQuickSetupStore.state;
  const { firmwareVariationId } = projectQuickSetupStore.constants;

  const targetDeviceSpec = { projectId, firmwareVariationId };

  useDeviceAutoConnectionAutoConnectFunction(targetDeviceSpec);

  const isConnectionValid =
    targetDeviceSpec &&
    useDeviceAutoConnectionConnectionStatus(targetDeviceSpec);

  const indicatorState = useDeviceKeyEventIndicatorModel(200);

  projectQuickSetupStore.state.isConnectionValid = isConnectionValid;

  return {
    isConnectionValid,
    isCommunicationIndicatorActive: isConnectionValid && indicatorState,
  };
}

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
