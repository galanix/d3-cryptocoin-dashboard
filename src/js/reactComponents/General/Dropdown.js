import React from 'react';

const Dropdown = props => (
    <div className={`${props.classesCSS.container} dropdown_container`}>
        <h4>{props.titleText}</h4>
        <div className={`dropdown ${props.classesCSS.dropdown}`}>
            <button className={`btn ${props.classesCSS.button} dropdown-toggle`} type="button" data-toggle="dropdown">
                <span className="caret"></span>
            </button>
            <ul className="dropdown-menu">
                {props.options.map((option, index) => (
                    <li key={index}>
                        <a data-value={option.dataValue}>
                            {!!option.textValue ? option.textValue : option.dataValue}
                        </a>
                    </li>
                ))}                
            </ul>
        </div>
    </div>
);

export default Dropdown;