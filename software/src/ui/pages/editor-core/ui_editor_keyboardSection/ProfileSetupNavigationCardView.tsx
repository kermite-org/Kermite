import { css, FC, jsx } from 'qx';
import { Link } from '~/ui/base';

export const ProfileSetupNavigationCardView: FC = () => {
  return (
    <div css={style}>
      <div className="card">
        <p>
          No profiles available. <br />
          Create first profile in &nbsp;
          <Link to="/presetBrowser" className="link">
            presets
          </Link>
          &nbsp; page.
        </p>
      </div>
    </div>
  );
};

const style = css`
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  > .card {
    width: 400px;
    height: 120px;
    border: solid 1px rgba(90, 90, 90, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;

    > p {
      line-height: 1.5em;

      .link {
        display: inline-block;
        color: #23f;
        cursor: pointer;
      }
    }
  }
`;