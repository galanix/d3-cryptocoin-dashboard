import React from 'react';

export default class WaitMessage extends React.Component {
  constructor() {
    super();
  }
  show() {
    this.p.style.opacity = 0.75;
  }
  hide() {
    this.p.style.opacity = 0;
  }
  render() {
    return ( <p ref={p => this.p = p} className="wait-message">{this.props.msg}</p> );
  }
};
