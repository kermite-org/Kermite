import { css, FC, jsx } from 'alumina';
import { IOnlineProjectAttributes } from '~/shared';
import { Icon, TooltipBalloon } from '~/ui/components';
import { KermiteServerBase64Icon } from '~/ui/fabrics/ProjectKeyboardList/KermiteServerBase64Icon';

type Props = {
  attrs: IOnlineProjectAttributes;
};

export const OnlineAttrsPart: FC<Props> = ({
  attrs: { authorDisplayName, authorIconUrl, isOfficial },
}) => {
  return (
    <div class={style}>
      <KermiteServerBase64Icon iconUrl={authorIconUrl} class="icon" />
      <div class="name">{authorDisplayName}</div>
      <div class="author-type">
        <div class="icon-box icon-box-official" if={isOfficial}>
          <TooltipBalloon class="balloon">
            このキーボード定義は、キーボードの設計者本人によって提供されています。
          </TooltipBalloon>
          {/* <Icon spec="fa fa-certificate" class="badge" /> */}
          <Icon spec="fa fa-certificate" class="badge" />
          <Icon spec="fa fa-check" class="check" />
        </div>
        <div class="icon-box icon-box-unofficial" if={!isOfficial}>
          <TooltipBalloon class="balloon">
            このキーボード定義は、キーボードの設計者ではない有志のユーザが作成したものです。
          </TooltipBalloon>
          <Icon spec="fa fa-user-friends" class="users" />
        </div>
      </div>
    </div>
  );
};

const style = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 3px;

  > .icon {
    width: 24px;
    height: 24px;
    border: solid 1px #888;
    border-radius: 20%;
    overflow: hidden;
  }

  > .author-type {
    margin-left: auto;

    > .icon-box {
      position: relative;
      width: 24px;
      height: 24px;

      /* border: solid 1px blue; */
      > i {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      > .badge {
        font-size: 20px;
        color: #fd4;
      }

      > .users {
        font-size: 18px;
        color: #bbc;
      }
      > .check {
        font-size: 13px;
        color: white;
      }

      > .balloon {
        position: absolute;
        left: -15px;
        top: -55px;
        display: none;
      }

      &:hover > .balloon {
        display: block;
      }
    }
  }
`;
