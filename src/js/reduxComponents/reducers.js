import { model } from "./model";

export default function reducers(state = model, action) {
    const newState = Object.assign({}, state);    
    switch(action.type) {
       case "UPDATE_DATA":
          switch(action.forComponent) {
              case "BitcoinCurrentPrice":
                newState.currentPrice.data = action.data;
                break;
              case "BitcoinHistoryGraph":
                newState.history.data = action.data;
                break;
              case "CurrencyPairGraph":
                newState.currencyPair.data = action.data;
                break;
              case "CryptoBoard_table":
                newState.cryptoBoard.table.data = action.data;
                break;
              case "CryptoBoard_chart":
                newState.cryptoBoard.chart.data = action.data;
                break;
          }
          break;
        case "CHANGE_FILTERS":
          switch(action.forComponent) {
            case "BitcoinHistoryGraph":
              assignNewFilterValue(action, newState.history);
              break;

            case "CurrencyPairGraph":
              assignNewFilterValue(action, newState.currencyPair);
              break;

            case "CryptoBoard_table":
              assignNewFilterValue(action, newState.cryptoBoard.table);
              break;

            case "CryptoBoard_chart":
              assignNewFilterValue(action, newState.cryptoBoard.chart);
              break;

            case "Settings":
              assignNewFilterValue(action, newState.settings);
              break;

            default:
              console.warn("action.forComponent switch defaulted with:", action.forComponent);
          }
          break;
        default:
          console.warn("action.type switch defaulted with", action.type);
    }
    return newState;
};

function assignNewFilterValue(action, objectToAssignTo) {
  if(action.filterName instanceof Array) {
    action.filterName.forEach((name, index) => {
      objectToAssignTo.filters[name] = action.newFilterValue[index];
    })
  } else objectToAssignTo.filters[action.filterName] = action.newFilterValue;  
};
