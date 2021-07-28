import { FC, jsx, css, useEffect } from 'qx';
import { Link, linkTo, router } from '~/ui/common/base';

const cssNavBox = css`
  display: flex;
  border: solid 1px red;
  padding: 4px;
  > :not(:first-child) {
    margin-left: 10px;
  }
`;

const cssNavButton = css`
  display: inline-block;
  border: solid 1px orange;
  color: orange;
  padding: 4px;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  &:hover {
    background: #fdc;
  }
`;

export const RoutingDevelopmentPage: FC = () => {
  useEffect(router.rerenderEffectOnHashChange, []);

  console.log(`render`, { hash: location.hash });

  const path = router.getPagePath();

  return (
    <div>
      {path === '/foo' && (
        <div>
          foo page
          <Link to="/">top</Link>
        </div>
      )}
      {(path === '' || path === '/') && (
        <div>
          root page
          <Link to="/foo">foo</Link>
          <div css={cssNavBox}>
            <Link to="/foo" className={cssNavButton}>
              foo
            </Link>
            <div onClick={linkTo('/foo')} css={cssNavButton}>
              foo
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
