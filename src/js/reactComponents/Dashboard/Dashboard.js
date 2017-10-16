import React from 'react';

import BitcoinCurrentPrice from './BitcoinCurrentPrice/BitcoinCurrentPrice';
import BitcoinHistoryGraph from './BitcoinHistoryGraph/BitcoinHistoryGraph';
import CurrencyPairGraph from './CurrencyPairGraph/CurrencyPairGraph';
import CryptoBoard from './CryptoBoard/CryptoBoard';

const Dashboard = props => (
    <div className="right_col" role="main">
        <div className="row">
            { props.data.settings.displayComponent.BitcoinCurrentPrice ? 
                <BitcoinCurrentPrice update={props.update}
                                    model={props.data.currentPrice}                                         
                                    signs={props.data.general.currencySigns}
                />   
                :
                null
            }
            { props.data.settings.displayComponent.BitcoinHistoryGraph ?
                <BitcoinHistoryGraph update={props.update}
                                    change={props.change}
                                    model={props.data.history}                                         
                                    signs={props.data.general.currencySigns}
                />
                :
                null
            }
            { props.data.settings.displayComponent.CurrencyPairGraph ?
                <CurrencyPairGraph update={props.update}
                                change={props.change}
                                model={props.data.currencyPair}                                       
                />
                :
                null

            }
            { props.data.settings.displayComponent.CryptoBoard ?
                <CryptoBoard update={props.update}
                            change={props.change}
                            model={props.data.cryptoBoard}                                    
                />
                :
                null
            }             
        </div>
    </div>
);


export default Dashboard;