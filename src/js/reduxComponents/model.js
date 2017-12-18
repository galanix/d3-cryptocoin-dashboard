import { formProperDateFormat } from '../helperFunctions';

function restorePrevSessionFilterValues(forComponent) {
  const prevSavedFilterValue = JSON.parse(localStorage.getItem(forComponent));
  const today = new Date();
  let defaultValues;

  switch (forComponent) {
    case 'BitcoinHistoryGraph':
      defaultValues = {
        currency: 'USD',
        end: formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        start: formProperDateFormat(today.getFullYear(), today.getMonth(), today.getDate()),
        timeline: 'less-than-3-month',
        timelineBtnGroup: '1-month',
      };
      break;
    case 'CurrencyPairGraph':
      defaultValues = {
        pairName: 'BTCLTC',
        hours: 2,
        dataPoints: 120, // === 1 min
        currentDivisor: 0.0167,
        frequency: '1 min',
      };
      break;
    case 'CryptoBoard__table':
      defaultValues = {
        currency: 'USD',
        limit: 100,
        marketCap: '0',
        price: '0',
        volume_24h: '0',
        sortTableValue: 'market_cap_',
      };
      break;
    case 'CryptoBoard__chart':
      defaultValues = {
        currency: 'USD',
        type: 'bar',
        comparisionField: 'price_usd',
      };
      break;
    case 'Settings__componentsToDisplay':
      defaultValues = {
        BitcoinCurrentPrice: true,
        BitcoinHistoryGraph: true,
        CurrencyPairGraph: true,
        CryptoBoard: true,
      };
      break;
    case 'Settings__filterSettings':
      defaultValues = {
        shouldFiltersBeSavedToLocalStorage: true,
      };
      break;
    default:
      defaultValues = {};
  }

  if (!prevSavedFilterValue) {
    return defaultValues;
  }

  const filterValues = {};
  Object.keys(defaultValues).forEach((prop) => {
    filterValues[prop] = prevSavedFilterValue[prop] || defaultValues[prop];
  });

  return filterValues;
}

// object that stores all of the raw data needed for app's initialization

const model = {
  general: {
    currencySigns: {
      EUR: '&#8364;',
      USD: '&#36;',
      UAH: '&#8372;',
      RUB: '&#8381;',
    },
  },
  BitcoinCurrentPrice: {
    url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    updateFrequency: 60000,
    data: {},
  },
  BitcoinHistoryGraph: {
    url: 'https://api.coindesk.com/v1/bpi/historical/close.json',
    margin: {
      top: 60, right: 60, bottom: 60, left: 60,
    },
    filters: restorePrevSessionFilterValues('BitcoinHistoryGraph'),
    ticksLevel: 3, // used by recursive function to calc ticks
    xTicksFormat: {
      'from-all-time-to-year': '%Y',
      'from-year-to-3-month': '%b\'%y',
      'less-than-3-month': '%e\'%b',
    },
    data: {},
  },
  CurrencyPairGraph: {
    margin: {
      top: 60, right: 60, bottom: 60, left: 60,
    },
    filters: restorePrevSessionFilterValues('CurrencyPairGraph'),
    dataPointDivisors: { // to get data_point we need to divide hours by these values
      '1 min': 0.0167, // (1 / 60)
      '5 mins': 0.0833, // (5 / 60)
      '10 mins': 0.1667, // (10 / 60)
      '30 mins': 0.5, // (30 / 60)
      '1 hour': 1,
      '3 hours': 3,
      '6 hours': 6,
      '12 hours': 12,
      '24 hours': 24,
    },
    data: {},
  },
  CryptoBoard: {
    url: 'https://api.coinmarketcap.com/v1/ticker/',
    table: {
      data: {},
      filters: restorePrevSessionFilterValues('CryptoBoard__table'),
      filterValues: {
        marketCap: {
          0: 'All',
          1: 1000000000,
          2: [100000000, 1000000000],
          3: [10000000, 100000000],
          4: [1000000, 10000000],
          5: [100000, 1000000],
          6: [0, 100000],
        },
        price: {
          0: 'All',
          1: 100,
          2: [1, 100],
          3: [0.01, 1],
          4: [0.0001, 0.01],
          5: [0, 0.0001],
        },
        volume_24h: {
          0: 'All',
          1: 10000000,
          2: 1000000,
          3: 100000,
          4: 10000,
          5: 1000,
        },
      },
    },
    chart: {
      data: {},
      margin: {
        left: 40, top: 30, right: 80, bottom: 50,
      }, // margin left is redetermined dynamically
      filters: restorePrevSessionFilterValues('CryptoBoard__chart'),
    },
  },
  Settings: {
    displayComponent: restorePrevSessionFilterValues('Settings__componentsToDisplay'),
    shouldFiltersBeSavedToLocalStorage: restorePrevSessionFilterValues('Settings__filterSettings'),
  },
  SavedGraphs: JSON.parse(window.localStorage.getItem('savedGraphs')) || [], // data for SavedGraphs component
};

export default model;
