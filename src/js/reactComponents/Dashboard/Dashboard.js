import React from 'react';

import BitcoinCurrentPrice from './BitcoinCurrentPrice/BitcoinCurrentPrice';
import BitcoinHistoryGraph from './BitcoinHistoryGraph/BitcoinHistoryGraph';
import CurrencyPairGraph from './CurrencyPairGraph/CurrencyPairGraph';
import CryptoBoard from './CryptoBoard/CryptoBoard';

export default class Dashboard extends React.Component {
    constructor() {
        super();
    }
    render() {
        return (
            <div className="right_col" role="main">
                <div className="row">
                    <BitcoinCurrentPrice update={this.props.update}
                                         model={this.props.data.currentPrice}
                                         display={this.props.data.general.displayComponent.BitcoinCurrentPrice}
                                         signs={this.props.data.general.currencySigns}
                    />
                    <BitcoinHistoryGraph update={this.props.update}
                                         change={this.props.change}
                                         model={this.props.data.history}
                                         display={this.props.data.general.displayComponent.BitcoinHistoryGraph}
                                         signs={this.props.data.general.currencySigns}
                    />
                    <CurrencyPairGraph update={this.props.update}
                                       change={this.props.change}
                                       model={this.props.data.currencyPair}
                                       display={this.props.data.general.displayComponent.CurrencyPairGraph}                    
                    />
                    <CryptoBoard />
                </div>
            </div>
        );
    }
};