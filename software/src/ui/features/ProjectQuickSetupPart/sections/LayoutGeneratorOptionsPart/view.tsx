import { css, FC, jsx, QxChild } from 'qx';
import { appUi, makePlainSelectorOption } from '~/ui/base';
import { RibbonSelector, ToggleSwitch } from '~/ui/components';
import { standardFirmwareEditModelHelpers } from '~/ui/editors/StandardFirmwareEditor/helpers';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

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

const FieldRow: FC<{ title: string; children: QxChild }> = ({
  title,
  children,
}) => (
  <div class="row">
    <div>{title}</div>
    <div>{children}</div>
  </div>
);

function valueChangeHandler<K extends keyof ILayoutGeneratorOptions>(key: K) {
  return (value: ILayoutGeneratorOptions[K]) => {
    projectQuickSetupStore.actions.writeLayoutOption(key, value);
  };
}

export const LayoutGeneratorOptionsPart: FC = () => {
  const { isSplit, layoutOptions, placementModeOptions } =
    useLayoutGeneratorOptionsPartModel();

  return (
    <div class={style}>
      <div class="props-table">
        <FieldRow title="placement origin">
          <RibbonSelector
            options={placementModeOptions}
            value={layoutOptions.placementOrigin}
            setValue={valueChangeHandler('placementOrigin')}
          />
        </FieldRow>
        <FieldRow title="invert X">
          <ToggleSwitch
            checked={layoutOptions.invertX}
            onChange={valueChangeHandler('invertX')}
          />
        </FieldRow>
        <FieldRow title="invert X right" qxIf={isSplit}>
          <ToggleSwitch
            checked={layoutOptions.invertXR}
            onChange={valueChangeHandler('invertXR')}
          />
        </FieldRow>
        <FieldRow title="invert Y">
          <ToggleSwitch
            checked={layoutOptions.invertY}
            onChange={valueChangeHandler('invertY')}
          />
        </FieldRow>
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
