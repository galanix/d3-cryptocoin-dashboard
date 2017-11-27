import React from 'react';

export default class Message extends React.Component {    
  render() {
    return (
      <p 
        style={{ opacity: this.props.isMessageVisible ? 0.75 : 0 }}        
        className={`message ${this.props.CSSClasses || ''}`}        
      >
        {this.props.msg}
      </p>
    );
  }
};
