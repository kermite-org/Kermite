import { css, FC, jsx } from 'qx';
import { ExtractKeysWithType } from '~/shared';
import { appUi } from '~/ui/base';
import { ToggleSwitch } from '~/ui/components';
import { standardFirmwareEditModelHelpers } from '~/ui/editors/StandardFirmwareEditor/helpers';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

function valueChangeHandler<K extends keyof ILayoutGeneratorOptions>(key: K) {
  return (value: ILayoutGeneratorOptions[K]) => {
    projectQuickSetupStore.actions.writeLayoutOption(key, value);
  };
}

type IFlagFieldKey = ExtractKeysWithType<
  Required<ILayoutGeneratorOptions>,
  boolean
>;

const ToggleSwitchRow: FC<{
  title: string;
  fieldKey: IFlagFieldKey;
}> = ({ title, fieldKey }) => {
  const { layoutOptions } = projectQuickSetupStore.state;
  return (
    <div class="row">
      <div>{title}</div>
      <ToggleSwitch
        checked={layoutOptions[fieldKey]}
        onChange={valueChangeHandler(fieldKey)}
      />
    </div>
  );
};

function useLayoutGeneratorOptionsPartModel() {
  appUi.setDebugValue({
    layoutOptions: projectQuickSetupStore.state.layoutOptions,
  });
  const { firmwareConfig } = projectQuickSetupStore.state;
  const isSplit = standardFirmwareEditModelHelpers.getIsSplit(
    firmwareConfig.baseFirmwareType,
  );
  return {
    isSplit,
  };
}

export const LayoutGeneratorOptionsPart: FC = () => {
  const { isSplit } = useLayoutGeneratorOptionsPartModel();
  return (
    <div class={style}>
      <div class="props-table">
        <ToggleSwitchRow title="invert X" fieldKey="invertX" />
        <ToggleSwitchRow
          title="invert X Right"
          fieldKey="invertXR"
          qxIf={isSplit}
        />
        <ToggleSwitchRow title="invert Y" fieldKey="invertY" />
      </div>
    </div>
  );
};

const style = css`
  > .props-table {
    display: table;
    border-collapse: separate;
    border-spacing: 10px;

    > .row {
      display: table-row;

      > * {
        display: table-cell;
      }
    }
  }
`;
