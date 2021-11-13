import { css, jsx } from 'alumina';
import { FcWithClassName } from '~/ui/base';
import { NavigationButton } from '~/ui/components';
import { useNavigationButtonsAreaModel } from '~/ui/root/organisms/NavigationBar/NavigationButtonsArea.model';

export const NavigationButtonsArea: FcWithClassName = ({ className }) => {
  const { navigationItems } = useNavigationButtonsAreaModel();
  return (
    <div css={style} className={className}>
      {navigationItems.map((item) => (
        <NavigationButton vm={item} key={item.pagePath} />
      ))}
    </div>
  );
};

const style = css`
  width: 100%;
`;
