import React from 'react';
import Message from './Message';

function ErrorMessageHOC(MessageComponent) {
  return function ErrorMessage(props) {
    return (
      <div style={{
        transition: 'maxHeight .3s ease-in',
        maxHeight: props.isMessageVisible ? '100px' : '0px',
      }}
      >
        <MessageComponent {...props} />
      </div>
    );
  };
}

export default ErrorMessageHOC(Message);

