import React from 'react';

const Header = props => (
    <header className={props.classesCSS}>
        <h2>{props.titleText}</h2>
    </header>
);

export default Header;

