import React from 'react';
import PropTypes from 'prop-types';

// COMPONENTS
import BitcoinCurrentPrice from './BitcoinCurrentPrice/BitcoinCurrentPrice';
import BitcoinHistoryGraph from './BitcoinHistoryGraph/BitcoinHistoryGraph';
import CurrencyPairGraph from './CurrencyPairGraph/CurrencyPairGraph';
import CryptoBoard from './CryptoBoard/CryptoBoard';

function Dashboard(props) {
  // object that tells whether component should render or not
  const { displayComponent } = props.data.Settings;
  return (
    <div className="row">
      { displayComponent.BitcoinCurrentPrice ?
        <BitcoinCurrentPrice
          update={props.update}
          model={props.data.BitcoinCurrentPrice}
          signs={props.data.general.currencySigns}
        />
        : null
      }
      { displayComponent.BitcoinHistoryGraph ?
        <BitcoinHistoryGraph
          update={props.update}
          change={props.change}
          model={props.data.BitcoinHistoryGraph}
          signs={props.data.general.currencySigns}
        />
        : null
      }
      { displayComponent.CurrencyPairGraph ?
        <CurrencyPairGraph
          update={props.update}
          change={props.change}
          model={props.data.CurrencyPairGraph}
        />
        : null
      }
      { displayComponent.CryptoBoard ?
        <CryptoBoard
          update={props.update}
          change={props.change}
          model={props.data.CryptoBoard}
          signs={props.data.general.currencySigns}
        />
        : null
      }
    </div>
  );
}

Dashboard.propTypes = {
  update: PropTypes.func,
  change: PropTypes.func,
  data: PropTypes.object,
};

export default Dashboard;
