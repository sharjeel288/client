import React, { Fragment } from 'react';
import NavigationItems from '../NavItems/navitems';
import BackDrop from '../BackDrop/BackDrop';

const sideDrawer = props => {
  let attachedClass = ['SideDrawer', 'Close'];
  if (props.open) {
    attachedClass = ['SideDrawer', 'Open'];
  }

  return (
    <Fragment>
      <BackDrop show={props.open} clicked={props.closed} />
      <div className={attachedClass.join(' ')} onClick={props.closed}>
        <nav>
          <NavigationItems
            items={props.items}
            activeItem={props.activeItem}
            onSelect={props.onSelect}
          />
        </nav>
      </div>
    </Fragment>
  );
};

export default sideDrawer;
