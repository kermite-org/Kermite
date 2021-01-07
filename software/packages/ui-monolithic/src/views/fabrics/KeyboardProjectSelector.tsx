import { css } from 'goober';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import { GeneralButton } from '../controls/GeneralButton';
import { GeneralSelector } from '../controls/GeneralSelector';
import { h } from '~qx';

interface IKeyboardProjectSelectorProps {
  selectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
}

const cssKeyboardProjectSelector = css`
  display: flex;
`;

export const KeyboardProjectSelector = (
  props: IKeyboardProjectSelectorProps,
) => {
  return (
    <div css={cssKeyboardProjectSelector}>
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
