import { css } from 'goober';
import { h } from '~lib/qx';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import { GeneralButton } from '../controls/GeneralButton';
import { GeneralSelector } from '../controls/GeneralSelector';

interface IKeyboardBreedSelector3Props {
  selectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
}

const cssKeyboardBreedSelector = css`
  display: flex;
`;

export const KeyboardBreedSelector3 = (props: IKeyboardBreedSelector3Props) => {
  return (
    <div css={cssKeyboardBreedSelector}>
      <GeneralSelector {...props.selectorSource} width={170} />
      <GeneralButton
        icon="fas fa-link"
        disabled={!props.isLinkButtonActive}
        handler={props.linkButtonHandler}
        className="linkButton"
        form="unitSquare"
      />
    </div>
  );
};
