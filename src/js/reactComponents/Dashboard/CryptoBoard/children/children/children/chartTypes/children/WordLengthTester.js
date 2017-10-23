import React from "react";

export default class WordLengthTester extends React.Component {
    getLengthOf(string) {
        this.p.textContent = string;
        return parseInt(getComputedStyle(this.p).width) + 1;
    }
    render() {
        return (
            <div id="word-length-tester">
                <p ref={p => this.p = p}></p>                
            </div>
        );
    }
};