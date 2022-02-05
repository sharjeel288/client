import React, { Fragment, useState } from 'react';
import Navbar from './Navbar/Navbar';
import SideDrawer from './SideDrawer/SideDrawer';
import DrawerToggle from './SideDrawer/DrawerToggle';

const Header = ({ user, tokens, contracts, selectToken }) => {
  const [sideDrawer, setSideDrawer] = useState(false);

  const openSide = () => {
    return setSideDrawer(!sideDrawer);
  };
  return (
    <Fragment>
      <Navbar>
        <DrawerToggle clicked={openSide} />
      </Navbar>

      <header id='header' className='header'>
        <SideDrawer
          closed={openSide}
          open={sideDrawer}
          items={tokens.map(token => ({
            label: token.ticker,
            value: token,
          }))}
          activeItem={{
            label: user.selectedToken.ticker,
            value: user.selectToken,
          }}
          onSelect={selectToken}
        />
        <div>
          <h1 className='header-title'>
            Dex-
            <span className='contract-address'>
              Contract Address:
              <span className='address'>{contracts.dex.options.address}</span>
            </span>
          </h1>
        </div>
      </header>
    </Fragment>
  );
};

export default Header;
