import React from "react";

export default class WordLengthTester extends React.Component {
    getLengthOf(content) {
      this.p.textContent = content;
      return parseInt(getComputedStyle(this.p).width, 10) + 1;
    }
    render() {
      return (
        <div id="word-length-tester">
          <p ref={p => this.p = p} style={{'fontSize': this.props.fontSize || '16px'}}></p>                
        </div>
      );
    }
};