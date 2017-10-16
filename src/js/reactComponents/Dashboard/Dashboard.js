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
                    { this.props.data.settings.displayComponent.BitcoinCurrentPrice ? 
                        <BitcoinCurrentPrice update={this.props.update}
                                         model={this.props.data.currentPrice}                                         
                                         signs={this.props.data.general.currencySigns}
                        />   
                        :
                        null
                    }
                    { this.props.data.settings.displayComponent.BitcoinHistoryGraph ?
                        <BitcoinHistoryGraph update={this.props.update}
                                         change={this.props.change}
                                         model={this.props.data.history}                                         
                                         signs={this.props.data.general.currencySigns}
                        />
                        :
                        null
                    }
                    { this.props.data.settings.displayComponent.CurrencyPairGraph ?
                        <CurrencyPairGraph update={this.props.update}
                                       change={this.props.change}
                                       model={this.props.data.currencyPair}                                       
                        />
                        :
                        null

                    }
                    { this.props.data.settings.displayComponent.CryptoBoard ?
                        <CryptoBoard update={this.props.update}
                                    change={this.props.change}
                                    model={this.props.data.cryptoBoard}                                    
                        />
                        :
                        null
                    }             
                </div>
            </div>
        );
    }
};