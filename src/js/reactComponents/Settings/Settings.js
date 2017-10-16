import React from 'react';

import Checkbox from './Checkbox';

class Settings extends React.Component {
    onClickHandler(evt) {
        console.log(evt.target.tagName);
    }
    render() {
        return (
            <div className="right_col" role="main">
                <section id="component-display" className="row">
                    <Checkbox componentName="currentPriceView"
                              title="Current Bitcoin Price"
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                    <Checkbox componentName="historyView" 
                              title="Bitcoin Price History" 
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                    <Checkbox componentName="currencyPairView"
                              title="Currency Comparison"
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                    <Checkbox componentName="cryptoBoardView"
                              title="Table of Currencies"
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                </section>
            </div>
        );      
    }
};

export default Settings;