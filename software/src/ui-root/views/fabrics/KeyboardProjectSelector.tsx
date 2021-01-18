import { css } from 'goober';
import { h } from 'qx';
import { ISelectorSource } from '~/ui-root/viewModels/viewModelInterfaces';
import { GeneralButton } from '../controls/GeneralButton';
import { GeneralSelector } from '../controls/GeneralSelector';

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
