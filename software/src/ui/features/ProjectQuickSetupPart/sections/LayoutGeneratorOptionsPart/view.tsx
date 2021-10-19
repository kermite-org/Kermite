import { css, FC, jsx, QxChild } from 'qx';
import { RibbonSelector, ToggleSwitch } from '~/ui/components';
import { ILayoutGeneratorOptions } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { useLayoutGeneratorOptionsPartModel } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutGeneratorOptionsPart/model';

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
        <FieldRow title="invert key indices Y" qxIf={false}>
          <ToggleSwitch
            checked={layoutOptions.invertY}
            onChange={valueChangeHandler('invertY')}
          />
        </FieldRow>
      </div>
      <div class="note">
        note: configurations for direct wired keys and encoders are not
        supported yet
      </div>
    </div>
  );
};

const style = css`
  margin: 5px;
  margin-top: 10px;
  > .props-table {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 10px;

    > .row {
      display: contents;
    }
  }

  > .note {
    margin-top: 10px;
    color: #888;
  }
`;
