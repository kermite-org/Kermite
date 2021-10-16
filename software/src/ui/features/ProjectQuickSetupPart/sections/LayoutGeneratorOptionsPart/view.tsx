import { css, FC, jsx } from 'qx';
import { ExtractKeysWithType } from '~/shared';
import { appUi, makePlainSelectorOption } from '~/ui/base';
import { RibbonSelector, ToggleSwitch } from '~/ui/components';
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
      <div>
        <ToggleSwitch
          checked={layoutOptions[fieldKey]}
          onChange={valueChangeHandler(fieldKey)}
        />
      </div>
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

  const placementModeOptions = ['topLeft', 'center'].map(
    makePlainSelectorOption,
  );
  const { layoutOptions } = projectQuickSetupStore.state;

  return {
    isSplit,
    layoutOptions,
    placementModeOptions,
  };
}

export const LayoutGeneratorOptionsPart: FC = () => {
  const { isSplit, layoutOptions, placementModeOptions } =
    useLayoutGeneratorOptionsPartModel();

  return (
    <div class={style}>
      <div class="props-table">
        <div class="row">
          <div>placement origin</div>
          <div>
            <RibbonSelector
              options={placementModeOptions}
              value={layoutOptions.placementOrigin}
              setValue={valueChangeHandler('placementOrigin')}
            />
          </div>
        </div>
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
