import model from './model';


// writes filter changes to the local storage
function writeFilterToLocalStorage(
  forComponent,
  filterName,
  newFilterValue,
  shouldFiltersBeSavedToLocalStorage,
) {
  if (!shouldFiltersBeSavedToLocalStorage) {
    return;
  }

  const filtersObject = JSON.parse(localStorage.getItem(forComponent)) || {};

  filtersObject[filterName] = newFilterValue;

  localStorage.setItem(forComponent, JSON.stringify(filtersObject));
}

// abstraction that handles filter value  update
function assignNewFilterValue(action, prevFilters, shouldFiltersBeSavedToLocalStorage) {
  const filters = JSON.parse(JSON.stringify(prevFilters));
  const { forComponent, filterName, newFilterValue } = action;

  if (filterName instanceof Array) {
    filterName.forEach((name, index) => {
      filters[name] = newFilterValue[index];
      writeFilterToLocalStorage(
        forComponent,
        name,
        newFilterValue[index],
        shouldFiltersBeSavedToLocalStorage,
      );
    });
  } else {
    filters[filterName] = newFilterValue;
    writeFilterToLocalStorage(
      forComponent,
      filterName,
      newFilterValue,
      shouldFiltersBeSavedToLocalStorage,
    );
  }
  return filters;
}


export default function reducers(state = model, action) {
  const newState = Object.assign({}, state);
  switch (action.type) {
    case 'UPDATE_DATA':
      switch (action.forComponent) { // action handling is slightly different throughout components
        case 'BitcoinCurrentPrice':
          newState.BitcoinCurrentPrice.data = action.data;
          break;

        case 'BitcoinHistoryGraph':
          newState.BitcoinHistoryGraph.data = action.data;
          break;

        case 'CurrencyPairGraph':
          newState.CurrencyPairGraph.data = action.data;
          break;

        case 'CryptoBoard__table':
          newState.CryptoBoard.table.data = action.data;
          break;

        case 'CryptoBoard__chart':
          newState.CryptoBoard.chart.data = action.data;
          break;

        case 'SavedGraphs': {
          const { data } = action;
          if (data instanceof Array) {
            newState.SavedGraphs = data; // replace dataset
          } else if (data.actionSubtype === 'add') { // update already existing dataset
            newState.SavedGraphs.unshift(data);
          } else { // data.actionSubtype === 'delete'
            newState.SavedGraphs.splice(data.index, 1);
          }
          window.localStorage.setItem('savedGraphs', JSON.stringify(newState.SavedGraphs));
          // to restore previously set dataset
          break;
        }
        default:
          console.warn('action.forComponent(UPDATA_DATA) switch defaulted with:', action.forComponent);
      }
      break;
    case 'CHANGE_FILTERS':
      switch (action.forComponent) { // action handling is almost the same throughout components
        case 'BitcoinHistoryGraph':
          newState.BitcoinHistoryGraph.filters =
            assignNewFilterValue(
              action,
              newState.BitcoinHistoryGraph.filters,
              newState.Settings.shouldFiltersBeSavedToLocalStorage,
            );
          break;

        case 'CurrencyPairGraph':
          newState.CurrencyPairGraph.filters =
            assignNewFilterValue(
              action,
              newState.CurrencyPairGraph.filters,
              newState.Settings.shouldFiltersBeSavedToLocalStorage,
            );
          break;

        case 'CryptoBoard__table':
          newState.CryptoBoard.table.filters =
            assignNewFilterValue(
              action,
              newState.CryptoBoard.table.filters,
              newState.Settings.shouldFiltersBeSavedToLocalStorage,
            );
          break;

        case 'CryptoBoard__chart':
          newState.CryptoBoard.chart.filters =
            assignNewFilterValue(
              action,
              newState.CryptoBoard.chart.filters,
              newState.Settings.shouldFiltersBeSavedToLocalStorage,
            );
          break;

        case 'Settings':
          newState.Settings[action.filterName] = action.newFilterValue;
          break;

        default:
          console.warn('action.forComponent(CHANGE_FILTERS) switch defaulted with:', action.forComponent);
      }
      break;

    default:
      console.warn('action.type switch defaulted with', action.type);
  }

  return newState;
}
