import { css, FC, jsx } from 'alumina';
import { SectionHeaderText } from '~/ui/elements';
import {
  BehaviorSelector2,
  MuteModeSelector2,
  LayoutStandardSelector,
  RoutingChannelSelector,
} from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/blocks/ConfigSelectors';

export const InputLogicOptionsPanelContent: FC = () => {
  return (
    <div class={style}>
      <SectionHeaderText text="Device Settings" icon="keyboard" xOffset={-2} />
      <dl class="table">
        <dt>Simulator Mode</dt>
        <dd>
          <BehaviorSelector2 />
        </dd>
        <dt>Mute Mode</dt>
        <dd>
          <MuteModeSelector2 />
        </dd>
        <dt>System Layout</dt>
        <dd>
          <LayoutStandardSelector />
        </dd>
        <dt>Routing Channel</dt>
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

    > dt {
      margin-right: 10px;
    }

    > dt,
    dd {
      min-height: 26px;
      display: flex;
      align-items: center;
    }
  }
`;
