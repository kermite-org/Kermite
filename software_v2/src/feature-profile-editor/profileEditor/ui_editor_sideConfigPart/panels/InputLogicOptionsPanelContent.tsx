import { css, FC, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { SectionHeaderText } from '~/fe-shared';
import {
  BehaviorSelector2,
  MuteModeSelector2,
  LayoutStandardSelector,
  RoutingChannelSelector,
} from '../blocks';

export const InputLogicOptionsPanelContent: FC = () => {
  return (
    <div class={style}>
      <SectionHeaderText
        text={texts.assignerDeviceSettingsPart.sectionHeader}
        icon="keyboard"
        xOffset={-2}
        hint={texts.assignerDeviceSettingsPartHint.sectionHeader}
      />
      <dl class="table">
        <dt>{texts.assignerDeviceSettingsPart.simulatorMode}</dt>
        <dd>
          <BehaviorSelector2 />
        </dd>
        <dt>{texts.assignerDeviceSettingsPart.muteMode}</dt>
        <dd>
          <MuteModeSelector2 />
        </dd>
        <dt>{texts.assignerDeviceSettingsPart.systemLayout}</dt>
        <dd>
          <LayoutStandardSelector />
        </dd>
        <dt>{texts.assignerDeviceSettingsPart.routingChannel}</dt>
        <dd>
          <RoutingChannelSelector />
        </dd>
      </dl>
    </div>
  );
};

const style = css`
  > .table {
    display: grid;
    grid-template-columns: auto auto;
    margin-top: 2px;
    font-size: 15px;

    > dt {
      margin-right: 10px;
    }

    > dt,
    dd {
      min-height: 30px;
      display: flex;
      align-items: center;
    }
  }
`;
