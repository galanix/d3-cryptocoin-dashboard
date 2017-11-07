import React from 'react';

import BitcoinCurrentPrice from './BitcoinCurrentPrice/BitcoinCurrentPrice';
import BitcoinHistoryGraph from './BitcoinHistoryGraph/BitcoinHistoryGraph';
import CurrencyPairGraph from './CurrencyPairGraph/CurrencyPairGraph';
import CryptoBoard from './CryptoBoard/CryptoBoard';

export default function Dashboard(props) {
  const displayComponent = props.data.settings.displayComponent;
  return (    
    <div className="row">
      { displayComponent.BitcoinCurrentPrice ? 
        <BitcoinCurrentPrice update={props.update}
                              model={props.data.currentPrice}                                         
                              signs={props.data.general.currencySigns} /> : null
      }
      { displayComponent.BitcoinHistoryGraph ?
        <BitcoinHistoryGraph update={props.update}
                              change={props.change}
                              model={props.data.history}                                         
                              signs={props.data.general.currencySigns} /> : null
      }
      { displayComponent.CurrencyPairGraph ?
          <CurrencyPairGraph update={props.update}
                              change={props.change}
                              model={props.data.currencyPair} /> : null
      }
      { displayComponent.CryptoBoard ?
          <CryptoBoard update={props.update}
                        change={props.change}
                        model={props.data.cryptoBoard}
                        signs={props.data.general.currencySigns} /> : null
      }             
    </div>
  );
}
