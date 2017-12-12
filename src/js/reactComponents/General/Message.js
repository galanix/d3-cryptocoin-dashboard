import React from 'react';
import PropType from 'prop-type';

export default function Message(props) {
  return (
    <p
      style={{ 
        opacity: props.isMessageVisible ? 0.75 : 0,
        color: props.color,
      }}
      className={`message ${props.CSSClasses || ''}`}
    >
      {props.msg}
    </p>
  );
}

Message.PropType = {
  msg: PropType.string,
  CSSClasses: PropType.string,
  isMessageVisible: PropType.bool,
};
