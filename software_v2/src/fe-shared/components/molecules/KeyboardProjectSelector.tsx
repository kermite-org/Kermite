import { jsx, css, FC } from 'alumina';
import { ISelectorSource, texts } from '~/app-shared';
import { GeneralButton, GeneralSelector } from '../atoms';

interface Props {
  selectorSource: ISelectorSource;
  isLinkButtonActive?: boolean;
  linkButtonHandler?(): void;
  hint?: string;
}

export const KeyboardProjectSelector: FC<Props> = (props) => (
  <div class={style}>
    <GeneralSelector {...props.selectorSource} width={170} hint={props.hint} />
    <GeneralButton
      icon="fa fa-link"
      disabled={!props.isLinkButtonActive}
      onClick={props.linkButtonHandler}
      size="unitSquare"
      hint={texts.presetBrowserHint.projectLinkButton}
      if={false}
    />
  </div>
);

const style = css`
  display: flex;
`;
