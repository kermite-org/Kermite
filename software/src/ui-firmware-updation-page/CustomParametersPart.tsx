import { css, FC, jsx } from 'qx';
import { generateNumberSequence } from '~/shared';
import { ipcAgent, ISelectorOption, useEventSource } from '~/ui-common';
import { GeneralSelector } from '~/ui-common/components';

interface ICustomParameterModel {
  type: 'Selection';
  index: number;
  options: ISelectorOption[];
  selectionKey: string;
  setSelectionKey(selectionKey: string): void;
}

function makeParameterModel(
  value: number,
  index: number,
): ICustomParameterModel {
  const options = generateNumberSequence(10).map((it) => ({
    label: it.toString(),
    value: it.toString(),
  }));
  const selectionKey = value.toString();

  const setSelectionKey = (selectionKey: string) => {
    const newValue = parseInt(selectionKey);
    ipcAgent.async.device_setCustomParameterValue(index, newValue);
  };

  return {
    type: 'Selection',
    index,
    options,
    selectionKey,
    setSelectionKey,
  };
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

  return {
    parameterModels:
      parameterValues?.map((value, index) =>
        makeParameterModel(value, index),
      ) || [],
  };
}

const cssParameterRow = css`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 10px;
  }
`;

const cssBase = css`
  .parameters-list {
    margin-top: 10px;
    > * + * {
      margin-top: 5px;
    }
  }
`;

export const CustomParametersPart: FC = () => {
  const { parameterModels } = useCustomParametersPartViewModel();
  return (
    <div css={cssBase}>
      <div>Custom Setting Parameters</div>
      <div className="parameters-list">
        {parameterModels.map((item) => (
          <div key={item.index} css={cssParameterRow}>
            <label>value {item.index}</label>
            <GeneralSelector
              options={item.options}
              value={item.selectionKey}
              setValue={item.setSelectionKey}
              width={50}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
