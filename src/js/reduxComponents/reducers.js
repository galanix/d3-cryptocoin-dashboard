import model from "./model";

const reducers = (state = model, action) => {
    const newState = Object.assign({}, state);
    switch(action.type) {
       case 'UPDATE_DATA':
          switch(action.forComponent) {
              case 'BitcoinCurrentPrice':              
                newState.currentPrice.data = action.data;
                break;
              case 'BitcoinHistoryGraph':
                newState.history.data = action.data;
                break;
          }
          break;
        case 'CHANGE_FILTERS':
          switch(action.forComponent) {
            case 'BitcoinHistoryGraph':
              if(action.filterName instanceof Array) {
                action.filterName.forEach((name, index) => {
                  newState.history.filters[name] = action.newFilterValue[index];
                })
              } else newState.history.filters[action.filterName] = action.newFilterValue;
              break;
          }
    }
    return newState;
}

export default reducers;