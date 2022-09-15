import { css, domStyled, effectOnMount, FC, jsx } from 'alumina';
import { kicadImporterStore } from '~/ui/features/kicadImporter/store';
import {
  BottomControlsSection,
  PcbShapeView,
  TopControlsSection,
} from './views';

export const KicadImporterPanelContentRoot: FC = () => {
  // effectOnMount(() => kicadImporterStore.actions.reset());
  effectOnMount(() => kicadImporterStore.actions.loadTestData());
  return domStyled(
    <div>
      <div class="inner">
        <div class="row">
          <TopControlsSection />
        </div>

        <div class="row">
          <PcbShapeView />
        </div>
        <div class="row">
          <BottomControlsSection />
        </div>
      </div>
    </div>,
    css`
      height: 100%;
      padding: 10px;
      > .inner {
        display: flex;
        flex-direction: column;
        overflow-x: hidden;

        > h1 {
          font-size: 40px;
          background: #6c8;
          color: #fff;
          padding-left: 10px;
          display: flex;
          align-items: center;
          gap: 3px;
          > i {
            margin-top: 3px;
          }
        }

        > .row {
          border: solid 1px #aaa;
          padding: 15px 20px;
        }
      }
    `,
  );
};
