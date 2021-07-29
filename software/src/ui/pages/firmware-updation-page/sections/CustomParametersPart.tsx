import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { GeneralSelector, CheckBox, Slider } from '~/ui/components';
import { useCustomParametersPartModel } from '~/ui/pages/firmware-updation-page/models';

export const CustomParametersPart: FC = () => {
  const {
    parameterModels,
    definitionUnavailable,
    isConnected,
    resetParameters,
  } = useCustomParametersPartModel();
  return (
    <div css={style}>
      <div>{texts.label_device_customParameters_sectionTitle}</div>
      {definitionUnavailable &&
        texts.label_device_customParameters_patamtersUnavailable}
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
    </div>
  );
};

const style = css`
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

  > .button-row {
    margin-top: 10px;
    display: flex;
    button {
      padding: 2px 5px;
      cursor: pointer;
    }
  }
`;
