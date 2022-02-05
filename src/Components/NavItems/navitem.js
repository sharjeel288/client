import React from 'react';

const navigationItem = props => (
  <li className='NavigationItem'>
    <a href='#' className='active' onClick={props.onclick}>
      {props.children}
    </a>
  </li>
);

export default navigationItem;
