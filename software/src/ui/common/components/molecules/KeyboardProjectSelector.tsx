import { jsx, css, FC } from 'qx';
import { ISelectorSource } from '~/ui/common';
import { GeneralButton } from '../atoms/GeneralButton';
import { GeneralSelector } from '../atoms/GeneralSelector';

interface Props {
  selectorSource: ISelectorSource;
  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
}

const style = css`
  display: flex;
`;

export const KeyboardProjectSelector: FC<Props> = (props) => (
  <div css={style}>
    <GeneralSelector {...props.selectorSource} width={170} />
    <GeneralButton
      icon="fa fa-link"
      disabled={!props.isLinkButtonActive}
      onClick={props.linkButtonHandler}
      size="unitSquare"
    />
  </div>
);
