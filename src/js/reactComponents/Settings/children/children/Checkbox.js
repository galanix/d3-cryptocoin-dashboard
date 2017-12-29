import React from 'react';

export default function Checkbox(props) {
  return (
    <div
      className="checkbox-component"
      onClick={evt => props.onClickHandler(evt)}
    >
      <button
        data-js-hook={props.jsHook}
        className={`btn btn-lg ${props.isItemChecked ? 'btn-success' : 'btn-danger'}`}
      >
        <i className={`fa ${props.isItemChecked ? 'fa-check' : 'fa-times'}`} />
      </button>
      <span className="title">{props.title}</span>
    </div>
  );
}

