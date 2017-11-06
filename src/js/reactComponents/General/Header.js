import React from 'react';

export default function Header(props) {
  return (
    <header className={props.classesCSS}>
      <h2>{props.titleText}</h2>
    </header>
  );
}
