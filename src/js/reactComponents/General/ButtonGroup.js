import React from 'react';

const ButtonGroup = props => (
    <div className={props.classesCSS} {...props.containerAttrs} >
        {props.buttons.map((btn, index) => (
            <button key={index} {...btn.attrs } className={`btn ${btn.classesCSS}`} id={btn.id}>{btn.textValue}</button>
        ))}
    </div>
);

export default ButtonGroup;