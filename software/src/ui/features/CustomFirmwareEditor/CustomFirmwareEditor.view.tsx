import { css, FC, jsx } from 'qx';
import { GeneralInput, GeneralSelector } from '~/ui/components';
import { customFirmwareEditorModel } from '~/ui/features/CustomFirmwareEditor/CustomFirmwareEditor.model';

export const CustomFirmwareEditorView: FC = () => {
  const {
    actions: { setVariationName, setCustomFirmwareId },
    readers: { editValues, allFirmwareOptions },
  } = customFirmwareEditorModel;
  return (
    <div css={style}>
      <div className="row">
        <div>variation name</div>
        <GeneralInput
          value={editValues.variationName}
          setValue={setVariationName}
        />
      </div>
      <div className="row">
        <div>firmware</div>
        <GeneralSelector
          options={allFirmwareOptions}
          value={editValues.customFirmwareId}
          setValue={setCustomFirmwareId}
        />
      </div>
    </div>
  );
};

const style = css`
  > .row {
    margin-top: 10px;
    display: flex;
    align-items: center;

    > :nth-child(1) {
      width: 150px;
    }

    > :nth-child(2) {
      width: 200px;
    }
  }
`;
