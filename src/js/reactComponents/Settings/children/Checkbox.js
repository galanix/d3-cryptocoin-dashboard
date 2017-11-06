import React from 'react';

export default function Checkbox(props) {
    return (
        <div className="col-md-12" onClick={evt => props.onClickHandler(evt)}>
            <button data-component_name={props.componentName} className="btn">
                <i className="fa fa-check"></i>
            </button>
            <span className="title">{props.title}</span>
        </div>
    );
}