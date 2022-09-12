import { css, domStyled, FC, jsx } from 'alumina';
import { makePlainSelectorOption } from '~/ui/base';
import { GeneralInput, GeneralSelector } from '~/ui/components';
import { allFootprintDisplayModes } from '../base';
import { kicadImporterStore } from '../store';

export const TopControlsSection: FC = () => {
  const {
    state: { footprintSearchWord, footprintDisplayMode },
    readers: { numFootprintsMatched },
    actions: { setFootprintSearchWord, setFootprintDisplayMode },
  } = kicadImporterStore;

  const inputWidth = 150;

  return domStyled(
    <div>
      <div class="top-row">
        <div>
          <label>footprint search word</label>
          <GeneralInput
            value={footprintSearchWord}
            setValue={setFootprintSearchWord}
            width={inputWidth}
          />
        </div>
        <div if={false}>
          <label>フットプリント表示</label>
          <GeneralSelector
            value={footprintDisplayMode}
            setValue={setFootprintDisplayMode}
            options={allFootprintDisplayModes.map(makePlainSelectorOption)}
            width={inputWidth}
          />
        </div>
      </div>

      <div>
        <p>{numFootprintsMatched} footprints matched.</p>
      </div>
    </div>,
    css`
      font-size: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      > .top-row {
        display: flex;
        gap: 30px;

        > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
      }
    `,
  );
};
