import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { GeneralSelector, CheckBox, Slider } from '~/ui/components';
import {
  PartBody,
  PartHeader,
} from '~/ui/pages/firmware-update-page/Components';
import { useCustomParametersPartModel } from '~/ui/pages/firmware-update-page/sections/CustomParametersPart/CustomParametersPartModel';

export const CustomParametersPart: FC = () => {
  const {
    parameterModels,
    definitionUnavailable,
    isConnected,
    resetParameters,
  } = useCustomParametersPartModel();
  return (
    <div css={style}>
      <PartHeader>
        {texts.label_device_customParameters_sectionTitle}
      </PartHeader>
      <PartBody className="part-body">
        {definitionUnavailable &&
          texts.label_device_customParameters_parametersUnavailable}
        <div className="parameters-list-outer">
          <div
            className="parameters-list"
            data-hint={texts.hint_device_customParameters_sectionArea}
          >
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
        <div className="button-row">
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
