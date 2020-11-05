import { css } from 'goober';
import { h } from '~lib/qx';
import { IPresetBrowserViewModel } from '~ui/viewModels/PresetBrowserViewModel';
import { PresetKeyboardSection } from '../organisms/PresetKeyboardSection';
import { PresetSelectionSection } from '../organisms/PresetSelectionSection';

const cssBase = css`
  background: #fff;
  height: 100%;
  padding: 20px;
  > * + * {
    margin-top: 10px;
  }
`;

export const PresetBrowserPage = (props: { vm: IPresetBrowserViewModel }) => {
  return (
    <div css={cssBase}>
      <div>Preset Browser</div>
      <PresetSelectionSection vm={props.vm} />
      <PresetKeyboardSection vm={props.vm} />
    </div>
  );
};
