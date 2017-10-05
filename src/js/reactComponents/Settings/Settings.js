import React from 'react';

import Checkbox from './Checkbox';

const Settings = () => (
    <div className="right_col" role="main">
        <section id="component-display" className="row">
            <Checkbox componentName="currentPriceView"
                      title="Current Bitcoin Price"
            />
            <Checkbox componentName="historyView" 
                      title="Bitcoin Price History" 
            />
            <Checkbox componentName="currencyPairView"
                      title="Currency Comparison"
            />
            <Checkbox componentName="cryptoBoardView"
                      title="Table of Currencies"
            />
        </section>
    </div>
);

export default Settings;