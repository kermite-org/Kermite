import { css, FC, jsx } from 'alumina';
import { GeneralInput } from '~/ui/components';

type Props = {
  keyboardName: string;
  setKeyboardName: (value: string) => void;
  validationError: string | undefined;
};
export const ProjectKeyboardNameEditPart: FC<Props> = ({
  keyboardName,
  setKeyboardName,
  validationError,
}) => {
  return (
    <div class={style}>
      <div className="field-name">Keyboard Name</div>
      <GeneralInput
        value={keyboardName}
        setValue={setKeyboardName}
        width={200}
      />
      <div class="error">{validationError}</div>
    </div>
  );
};

const style = css`
  display: flex;
  align-items: center;

  > .field-name {
    margin-right: 10px;
  }

  > .error {
    color: red;
  }
`;
