import React from 'react';

const Checkbox = props => (
    <div className="col-md-12">
        <button data-component_name={props.componentName} className="btn">
            <span className="fa fa-check"></span>
        </button>
        <span className="title">{props.title}</span>
    </div>
);

export default Checkbox;