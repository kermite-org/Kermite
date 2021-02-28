import { jsx, css } from 'qx';
import { ISelectorSource } from '~/ui-common';
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
        icon="fa fa-link"
        disabled={!props.isLinkButtonActive}
        onClick={props.linkButtonHandler}
        size="unitSquare"
      />
    </div>
  );
};
