import React from 'react';

import BitcoinCurrentPrice from './BitcoinCurrentPrice/BitcoinCurrentPrice';
import BitcoinHistoryGraph from './BitcoinHistoryGraph/BitcoinHistoryGraph';
import CurrencyPairGraph from './CurrencyPairGraph/CurrencyPairGraph';
import CryptoBoard from './CryptoBoard/CryptoBoard';

const Dashboard = () => (
    <div className="right_col" role="main">
        <div className="row">
            <BitcoinCurrentPrice />
            <BitcoinHistoryGraph />
            <CurrencyPairGraph />
            <CryptoBoard />
        </div>
    </div>
);

export default Dashboard;