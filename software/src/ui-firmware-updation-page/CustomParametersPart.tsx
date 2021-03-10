import { css, FC, jsx } from 'qx';
import { ICustromParameterSpec } from '~/shared';
import {
  ipcAgent,
  ISelectorOption,
  useEventSource,
  useFetcher2,
} from '~/ui-common';
import { CheckBox, GeneralSelector, Slider } from '~/ui-common/components';

type ICustomParameterModel =
  | {
      type: 'toggle';
      slotIndex: number;
      label: string;
      enabled: boolean;
      setEnabled(enabled: boolean): void;
    }
  | {
      type: 'selection';
      slotIndex: number;
      label: string;
      options: ISelectorOption[];
      selectionKey: string;
      setSelectionKey(selectionKey: string): void;
    }
  | {
      type: 'linear';
      slotIndex: number;
      label: string;
      min: number;
      max: number;
      value: number;
      setValue(value: number): void;
    }
  | {
      type: 'invalidType';
      slotIndex: number;
      label: string;
    };

function makeParameterModel(
  parameterSpec: ICustromParameterSpec,
  currentValue: number,
): ICustomParameterModel {
  const { label, slotIndex } = parameterSpec;
  if (parameterSpec.type === 'toggle') {
    return {
      type: 'toggle',
      slotIndex,
      label,
      enabled: currentValue !== 0,
      setEnabled: (enabled: boolean) => {
        ipcAgent.async.device_setCustomParameterValue(
          slotIndex,
          enabled ? 1 : 0,
        );
      },
    };
  }
  if (parameterSpec.type === 'selection') {
    const options: ISelectorOption[] = parameterSpec.options.map((it) => ({
      value: it.value.toString(),
      label: it.label,
    }));
    const selectionKey = currentValue.toString();

    const setSelectionKey = (selectionKey: string) => {
      const newValue = parseInt(selectionKey);
      ipcAgent.async.device_setCustomParameterValue(slotIndex, newValue);
    };

    return {
      type: 'selection',
      slotIndex,
      label,
      options,
      selectionKey,
      setSelectionKey,
    };
  }
  if (parameterSpec.type === 'linear') {
    const setValue = (value: number) => {
      ipcAgent.async.device_setCustomParameterValue(slotIndex, value >> 0);
    };
    return {
      type: 'linear',
      slotIndex,
      label,
      min: 0,
      max: parameterSpec.maxValue,
      value: currentValue,
      setValue,
    };
  }
  return { type: 'invalidType', slotIndex, label };
}

interface ICustomParametersPartViewModel {
  parameterModels: ICustomParameterModel[];
}

function useCustomParametersPartViewModel(): ICustomParametersPartViewModel {
  const deviceStatus = useEventSource(
    ipcAgent.events.device_keyboardDeviceStatusEvents,
    {
      isConnected: false,
    },
  );

  const parameterValues =
    (deviceStatus.isConnected && deviceStatus.customParameterValues) ||
    undefined;

  const deviceAttrs =
    (deviceStatus.isConnected && deviceStatus.deviceAttrs) || undefined;

  const customDef = useFetcher2(
    () =>
      deviceAttrs &&
      ipcAgent.async.projects_getProjectCustomDefinition(
        deviceAttrs.origin,
        deviceAttrs.projectId,
      ),
    [deviceAttrs],
  );

  return {
    parameterModels:
      (customDef &&
        parameterValues &&
        customDef.customParameterSpecs.map((spec) =>
          makeParameterModel(spec, parameterValues[spec.slotIndex]),
        )) ||
      [],
  };
}

const cssBase = css`
  > .parameters-list-outer {
    display: inline-block;
    margin-top: 10px;

    > .parameters-list {
      display: grid;
      grid-template-columns: auto auto;
      gap: 8px 20px;
      align-items: center;

      > .row {
        display: contents;
      }
    }
  }
`;

export const CustomParametersPart: FC = () => {
  const { parameterModels } = useCustomParametersPartViewModel();
  return (
    <div css={cssBase}>
      <div>Custom Setting Parameters</div>
      <div className="parameters-list-outer">
        <div className="parameters-list">
          {parameterModels.map((item) => (
            <div key={item.slotIndex} className="row">
              <label>{item.label}</label>
              <div>
                {item.type === 'selection' && (
                  <GeneralSelector
                    options={item.options}
                    value={item.selectionKey}
                    setValue={item.setSelectionKey}
                    width={100}
                  />
                )}
                {item.type === 'toggle' && (
                  <CheckBox
                    checked={item.enabled}
                    setChecked={item.setEnabled}
                  />
                )}
                {item.type === 'linear' && (
                  <Slider
                    value={item.value}
                    min={item.min}
                    max={item.max}
                    onChange={item.setValue}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
