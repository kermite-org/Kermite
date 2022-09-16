import { css, domStyled, FC, jsx } from 'alumina';
import { makePlainSelectorOption } from '~/ui/base';
import { CheckBoxLine, GeneralInput, GeneralSelector } from '~/ui/components';
import { allFootprintDisplayModes } from '../base';
import { kicadImporterStore } from '../store';

export const TopControlsSection: FC = () => {
  const {
    state: {
      footprintSearchWord,
      footprintDisplayMode,
      dataLoaded,
      isKeyFacingInverted,
    },
    readers: { numFootprintsMatched },
    actions: {
      setFootprintSearchWord,
      setFootprintDisplayMode,
      setKeyFacingInverted,
    },
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
            disabled={!dataLoaded}
          />
        </div>
        <div>
          <CheckBoxLine
            text="invert facing"
            checked={isKeyFacingInverted}
            setChecked={setKeyFacingInverted}
            disabled={!dataLoaded}
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

      <div class="second-row">
        <p class={['count-text', dataLoaded && 'active']}>
          <p>{numFootprintsMatched} footprints matched.</p>
        </p>
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

      > .second-row {
        visibility: hidden;
        > .count-text.active {
          visibility: visible;
        }
      }
    `,
  );
};
