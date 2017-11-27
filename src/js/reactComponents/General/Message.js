import React from 'react';

export default class Message extends React.Component {  
  show() {
    this.p.style.opacity = 0.75;
  }
  hide() {
    this.p.style.opacity = 0;
  }
  render() {
    return (
      <p 
        ref={p => this.p = p} 
        className={`message ${this.props.CSSClasses || ''}`}        
      >
        {this.props.msg}
      </p>
    );
  }
};
