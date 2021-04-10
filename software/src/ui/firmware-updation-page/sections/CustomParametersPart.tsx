import { css, FC, jsx } from 'qx';
import { CheckBox, GeneralSelector, Slider, texts } from '~/ui/common';
import { useCustomParametersPartModel } from '~/ui/firmware-updation-page/models';

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
`;

export const CustomParametersPart: FC = () => {
  const {
    parameterModels,
    definitionUnavailable,
  } = useCustomParametersPartModel();
  return (
    <div css={style}>
      <div>{texts.label_device_customParameters_sectionTitle}</div>
      {definitionUnavailable &&
        texts.label_device_customParameters_patamtersUnavailable}
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
