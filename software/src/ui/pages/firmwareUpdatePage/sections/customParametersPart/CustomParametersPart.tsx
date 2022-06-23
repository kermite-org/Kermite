import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { GeneralSelector, CheckBox, Slider } from '~/ui/components';
import { PartBody, PartHeader } from '~/ui/pages/firmwareUpdatePage/Components';
import { useCustomParametersPartModel } from '~/ui/pages/firmwareUpdatePage/sections/customParametersPart/customParametersPartModel';

export const CustomParametersPart: FC = () => {
  const {
    parameterModels,
    definitionUnavailable,
    isConnected,
    resetParameters,
  } = useCustomParametersPartModel();
  return (
    <div class={style}>
      <PartHeader>{texts.deviceCustomParameters.sectionTitle}</PartHeader>
      <PartBody class="part-body">
        {definitionUnavailable &&
          texts.deviceCustomParameters.parametersUnavailable}
        <div class="parameters-list-outer">
          <div
            class="parameters-list"
            data-hint={texts.deviceCustomParametersHint.sectionArea}
          >
            {parameterModels.map((item) => (
              <div key={item.slotIndex} class="row">
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
        <div class="button-row">
          {isConnected && !definitionUnavailable && (
            <button onClick={resetParameters}>Reset To Default</button>
          )}
        </div>
      </PartBody>
    </div>
  );
};

const style = css`
  > .part-body {
    > .parameters-list-outer {
      display: inline-block;

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

    > .button-row {
      margin-top: 10px;
      display: flex;
      button {
        padding: 2px 5px;
        cursor: pointer;
      }
    }
  }
`;
