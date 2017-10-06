import React from 'react';

import BitcoinCurrentPrice from './BitcoinCurrentPrice/BitcoinCurrentPrice';
import BitcoinHistoryGraph from './BitcoinHistoryGraph/BitcoinHistoryGraph';
import CurrencyPairGraph from './CurrencyPairGraph/CurrencyPairGraph';
import CryptoBoard from './CryptoBoard/CryptoBoard';

class Dashboard extends React.Component {
    constructor() {
        super();
    }
    render() {        
        return (
            <div className="right_col" role="main">
                <div className="row">
                    <BitcoinCurrentPrice display={this.props.data.general.displayComponent.BitcoinCurrentPrice}
                                         data={this.props.data.currentPrice.data}
                                         url={this.props.data.currentPrice.url}
                                         updateFrequency={this.props.data.currentPrice.updateFrequency}
                                         update={this.props.update}
                                         signs={this.props.data.general.currencySigns}                                         
                    />
                    <BitcoinHistoryGraph />
                    <CurrencyPairGraph />
                    <CryptoBoard />
                </div>
            </div>
        );
    }
} 

export default Dashboard;