import { jsx } from 'alumina';
import { TooltipBallon } from '~/ui/components/atoms/TooltipBaloon';

export default {
  patternA: (
    <TooltipBallon>
      このキーボード定義は、キーボードの設計者本人によって提供されています。
    </TooltipBallon>
  ),
  patternB: (
    <TooltipBallon>
      このキーボード定義は、キーボードの設計者ではない有志のユーザが作成したものです。
    </TooltipBallon>
  ),
};
