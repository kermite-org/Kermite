import { css, FC, jsx } from 'qx';
import { Link } from '~/ui/base';

export const ProfileSetupWizard: FC = () => {
  return (
    <div className={style}>
      profile setup wizard
      <Link to="/home">x</Link>
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
