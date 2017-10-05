import React from 'react';

const BtnGroup = props => (
    <div className={`btn-group ${props.classesCSS}`}>
        {props.buttons.map((btn, index) => (
            <button key={index} {...btn.attributes } className={`btn ${btn.classesCSS}`}>{btn.textValue}</button>
        ))}
    </div>
);

export default BtnGroup;