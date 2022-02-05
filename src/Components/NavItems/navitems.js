import React from 'react';
import NavigationItem from './navitem';

const navigationItems = ({ onSelect, activeItem, items }) => {
  const selectItem = (e, item) => {
    e.preventDefault();
    onSelect(item);
  };
  return (
    <ul className='NavigationItems'>
      {items &&
        items.map((item, i) => (
          <NavigationItem key={i} onclick={e => selectItem(e, item.value)}>
            {item.label}
          </NavigationItem>
        ))}
    </ul>
  );
};

export default navigationItems;
