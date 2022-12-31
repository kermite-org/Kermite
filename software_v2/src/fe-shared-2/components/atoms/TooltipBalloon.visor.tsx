import { jsx } from 'alumina';
import { TooltipBalloon } from './TooltipBalloon';

export default {
  patternA: (
    <TooltipBalloon>
      このキーボード定義は、キーボードの設計者本人によって提供されています。
    </TooltipBalloon>
  ),
  patternB: (
    <TooltipBalloon>
      このキーボード定義は、キーボードの設計者ではない有志のユーザが作成したものです。
    </TooltipBalloon>
  ),
};
