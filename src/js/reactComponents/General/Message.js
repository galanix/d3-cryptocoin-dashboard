import React from 'react';
import PropType from 'prop-types';

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

Message.propTypes = {
  color: PropType.string,
  msg: PropType.string,
  CSSClasses: PropType.string,
  isMessageVisible: PropType.bool,
};
