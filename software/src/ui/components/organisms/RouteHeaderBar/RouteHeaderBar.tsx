import { css, FC, jsx } from 'qx';
import { LinkButton } from '~/ui/components/utils/LinkButton';

type Props = {
  className?: string;
  title: string;
  backPagePath?: string;
  canSave?: boolean;
  saveHandler?(): void;
  editMode?: 'Create' | 'Edit';
};

export const RouteHeaderBar: FC<Props> = ({
  className,
  title,
  backPagePath,
  canSave,
  saveHandler,
  editMode = 'Edit',
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
      {editMode === 'Create' && 'create'}
      {editMode === 'Edit' && 'save'}
    </button>
  </div>
);

const style = css`
  flex-shrink: 0;
  background: #cde;

  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;

  > .back-button {
    margin-left: 6px;
    border: none;
    border-radius: 3px;
    background: #fff;
    padding: 2px 3px;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #14a;
    font-size: 16px;

    &:before {
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
      content: '\\f359';
      margin-right: 2px;
    }

    &:hover {
      opacity: 0.8;
    }
  }

  > .title {
    margin-left: 8px;
    color: #14a;
  }

  > .save-button {
    margin-left: auto;
    margin-right: 4px;
    cursor: pointer;
    border: none;
    border-radius: 3px;
    background: #fff;
    padding: 2px 4px;
    color: #14a;
    font-size: 16px;

    &:before {
      font-family: 'Font Awesome 5 Free';
      font-weight: 900;
      content: '\\f0c7';
      margin-right: 2px;
    }

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
`;
