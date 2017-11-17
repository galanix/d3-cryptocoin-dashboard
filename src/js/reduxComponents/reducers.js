import { model } from './model';

export default function reducers(state = model, action) {
    const newState = Object.assign({}, state);    
    switch(action.type) {
       case 'UPDATE_DATA':
          switch(action.forComponent) { // action handling is slightly different throughout components
            case 'BitcoinCurrentPrice':
              newState.currentPrice.data = action.data;
              break;

            case 'BitcoinHistoryGraph':
              newState.history.data = action.data;
              break;

            case 'CurrencyPairGraph':
              newState.currencyPair.data = action.data;
              break;

            case 'CryptoBoard_table':              
              newState.cryptoBoard.table.data = action.data;
              break;

            case 'CryptoBoard_chart':
              newState.cryptoBoard.chart.data = action.data;
              break;

            case 'SavedGraphs': {
              const data = action.data;
              
              if(data instanceof Array) {
                newState.savedGraphs = data; // replace dataset
              } else { // update already existing dataset
                if(data.actionSubtype === 'add') { 
                  newState.savedGraphs.unshift(data);
                } else { // item.actionSubtype === 'delete'
                  newState.savedGraphs.splice(data.index, 1);
                }
              }
          
              window.localStorage.setItem('savedGraphs', JSON.stringify(newState.savedGraphs)); // to restore previously set dataset
              break;
            }
            
            default:
              console.warn('action.forComponent(UPDATA_DATA) switch defaulted with:', action.forComponent);
          }
          break;
        
        case 'CHANGE_FILTERS':
          switch(action.forComponent) { // action handling is almost the same throughout components
            case 'BitcoinHistoryGraph':
              assignNewFilterValue(action, newState.history);
              break;

            case 'CurrencyPairGraph':
              assignNewFilterValue(action, newState.currencyPair);
              break;

            case 'CryptoBoard_table':
              assignNewFilterValue(action, newState.cryptoBoard.table);
              break;

            case 'CryptoBoard_chart':
              assignNewFilterValue(action, newState.cryptoBoard.chart);
              break;

            case 'Settings':
              newState.settings[action.filterName] = action.newFilterValue;
              break;

            default:
              console.warn('action.forComponent(CHANGE_FILTERS) switch defaulted with:', action.forComponent);
          }
          break;

        default:
          console.warn('action.type switch defaulted with', action.type);
    }

    return newState;
};

// abstraction that handles filter value  update
function assignNewFilterValue(action, objectToAssignTo) {
  if(action.filterName instanceof Array) {
    action.filterName.forEach((name, index) => {
      objectToAssignTo.filters[name] = action.newFilterValue[index];
    })
  } else {
    objectToAssignTo.filters[action.filterName] = action.newFilterValue; 
  }
};
