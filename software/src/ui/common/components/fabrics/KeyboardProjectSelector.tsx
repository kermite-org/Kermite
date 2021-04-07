import { css, jsx } from 'qx';
import { ISelectorSource, texts } from '~/ui/common';
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
      <GeneralSelector
        {...props.selectorSource}
        width={170}
        hint={texts.hint_presetBrowser_selection_keyboard}
      />
      <GeneralButton
        icon="fa fa-link"
        disabled={!props.isLinkButtonActive}
        onClick={props.linkButtonHandler}
        size="unitSquare"
        hint={texts.hint_presetBrowser_projectLinkButton}
      />
    </div>
  );
};
