import { css, FC, jsx, QxChild } from 'qx';
import { IStandardFirmwareConfig } from '~/shared';
import { ILayoutGeneratorOptions } from '~/ui/base';
import { RibbonSelector, ToggleSwitch } from '~/ui/components';
import {
  IWriteLayoutOptionFunc,
  useLayoutGeneratorOptionsPartModel,
} from '~/ui/fabrics/LayoutGeneratorOptionsPart/model';

type Props = {
  firmwareConfig: IStandardFirmwareConfig;
  layoutOptions: ILayoutGeneratorOptions;
  writeLayoutOption: IWriteLayoutOptionFunc;
};

const FieldRow: FC<{ title: string; children: QxChild }> = ({
  title,
  children,
}) => (
  <div class="row">
    <div>{title}</div>
    <div>{children}</div>
  </div>
);

export const LayoutGeneratorOptionsPart: FC<Props> = ({
  firmwareConfig,
  layoutOptions,
  writeLayoutOption,
}) => {
  const { isOddSplit, placementModeOptions, valueChangeHandler } =
    useLayoutGeneratorOptionsPartModel(firmwareConfig, writeLayoutOption);

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
        <FieldRow title="invert column placement">
          <ToggleSwitch
            checked={layoutOptions.invertX}
            onChange={valueChangeHandler('invertX')}
          />
        </FieldRow>
        <FieldRow title="invert column placement right" qxIf={isOddSplit}>
          <ToggleSwitch
            checked={layoutOptions.invertXR}
            onChange={valueChangeHandler('invertXR')}
          />
        </FieldRow>
        <FieldRow title="invert row placement" qxIf={false}>
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