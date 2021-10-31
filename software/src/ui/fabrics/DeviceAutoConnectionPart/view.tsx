import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { useDeviceAutoConnectionEffects } from '~/ui/fabrics/DeviceAutoConnectionPart/hooks';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionLayoutComponents';

type Props = {
  projectInfo: IProjectPackageInfo;
  firmwareVariationId: string;
};

export const DeviceAutoConnectionPart: FC<Props> = ({
  projectInfo,
  firmwareVariationId,
}) => {
  const { isConnectionValid, isCommunicationIndicatorActive } =
    useDeviceAutoConnectionEffects(projectInfo.projectId, firmwareVariationId);
  const { keyboardName } = projectInfo;

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
        <div>{keyboardName}</div>
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
