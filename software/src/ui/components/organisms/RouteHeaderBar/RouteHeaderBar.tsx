import { css, FC, jsx } from 'qx';
import { LinkButton } from '~/ui/components/utils/LinkButton';

type Props = {
  className?: string;
  title: string;
  backPagePath?: string;
  canSave?: boolean;
  saveHandler?(): void;
};

export const RouteHeaderBar: FC<Props> = ({
  className,
  title,
  backPagePath,
  canSave,
  saveHandler,
}) => (
  <div css={style} className={className}>
    <LinkButton className="back-button" qxIf={!!backPagePath}>
      back
    </LinkButton>
    <div className="title">{title}</div>
    <button
      className="save-button"
      qxIf={!!saveHandler}
      onClick={saveHandler}
      disabled={!canSave}
    >
      save
    </button>
  </div>
);

const style = css`
  background: #abc;

  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;

  > .back-button {
    margin-left: 4px;
    border-radius: 3px;
    background: #fff;
    padding: 0 2px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #008;
    font-size: 15px;

    &::before {
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
      content: '\\f359';
      margin-right: 1px;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  > .title {
    margin-left: 8px;
    color: #008;
  }

  > .save-button {
    margin-left: auto;
    margin-right: 4px;
    cursor: pointer;
  }
`;
