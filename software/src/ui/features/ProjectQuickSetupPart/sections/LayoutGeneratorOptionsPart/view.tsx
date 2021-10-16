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
  const isOddSplit = standardFirmwareEditModelHelpers.getIsOddSplit(
    firmwareConfig.baseFirmwareType,
  );

  const placementModeOptions = ['topLeft', 'center'].map(
    makePlainSelectorOption,
  );
  const { layoutOptions } = projectQuickSetupStore.state;

  return {
    isOddSplit,
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
  const { isOddSplit, layoutOptions, placementModeOptions } =
    useLayoutGeneratorOptionsPartModel();

  return (
    <div class={style}>
      <div class="props-table">
        <FieldRow title="key placement anchor">
          <RibbonSelector
            options={placementModeOptions}
            value={layoutOptions.placementOrigin}
            setValue={valueChangeHandler('placementOrigin')}
          />
        </FieldRow>
        <FieldRow title="invert key indices X">
          <ToggleSwitch
            checked={layoutOptions.invertX}
            onChange={valueChangeHandler('invertX')}
          />
        </FieldRow>
        <FieldRow title="invert key indices X right" qxIf={isOddSplit}>
          <ToggleSwitch
            checked={layoutOptions.invertXR}
            onChange={valueChangeHandler('invertXR')}
          />
        </FieldRow>
        <FieldRow title="invert key indices Y">
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
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 10px;

    > .row {
      display: contents;
    }
  }
`;
