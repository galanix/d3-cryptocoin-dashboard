import { formProperDateFormat } from '../helperFunctions';

const today = new Date();

export const model = {
  general: {
    currencySigns: {
    EUR: '&#8364;',
    USD: '&#36;',
    UAH: '&#8372;',
    RUB: '&#8381;'
    },        
  },
  currentPrice: {
    url: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    updateFrequency: 60000,    
    data: {},   
  },
  history: {
    url: 'https://api.coindesk.com/v1/bpi/historical/close.json',    
    margin: { top: 60, right: 60, bottom: 60, left: 60 },
    filters: {
      currency: 'USD',
      end: formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      start: formProperDateFormat(today.getFullYear(), today.getMonth(), today.getDate()), 
      currentTimeline: 'less-than-3-month',
    },
    ticksLevel: 3, // used by recursive function to calc ticks
    xTicksFormat: {
      'from-all-time-to-year': '%Y',
      'from-year-to-3-month': '%b\'%y',
      'less-than-3-month': '%e\'%b',        
    },
    data: {},
  },
  currencyPair: {
    margin: { top: 60, right: 60, bottom: 60, left: 60 }, 
    filters: {
      pairName: 'BTCLTC',
      hours: 2,
      dataPoints: 120, // === 1 min
      currentDivisor: 0.0167,
      frequency: '1 min'
    },
    dataPointDivisors: { // to get data_point we need to divide hours by these values
      '1 min': 0.0167, // (1 / 60)      
      '5 mins': 0.0833,// (5 / 60)      
      '10 mins': 0.1667, // (10 / 60)      
      '30 mins': 0.5, // (30 / 60)      
      '1 hour': 1,    
      '3 hours': 3,
      '6 hours': 6,
      '12 hours': 12,
      '24 hours': 24
    },
    data: {},
  },
  cryptoBoard: {
    url: 'https://api.coinmarketcap.com/v1/ticker/',
    table: {
      data: {},
      filters: {
        currency: 'USD',
        limit: 100,
        marketCap: '0',
        price: '0',
        volume_24h: '0',            
      },
      filterValues: {
        marketCap: {
         '0': 'All',
         '1': 1000000000,
         '2': [100000000, 1000000000],
         '3': [10000000, 100000000],
         '4': [1000000, 10000000],
         '5': [100000, 1000000],
         '6': [0, 100000]
        },
        price: {
         '0': 'All',
         '1': 100,
         '2': [1, 100],
         '3': [0.01, 1],
         '4': [0.0001, 0.01],
         '5': [0, 0.0001],
        },
        volume_24h: {
          '0': 'All',
          '1': 10000000,
          '2': 1000000,
          '3': 100000,
          '4': 10000,
          '5': 1000,
        },
      }
    },
    chart: {
      data: {},            
      margin: { left: 40, top: 30, right: 80, bottom: 50 }, // margin left is redetermined dynamically
      filters: {
        currency: 'USD',
        type: 'bar',
        comparisionField: 'price_usd',
      }
    },    
  },
  settings: {
    displayComponent: JSON.parse(window.localStorage.getItem('displayComponent')) || {
      BitcoinCurrentPrice: true,
      BitcoinHistoryGraph: true,
      CurrencyPairGraph: true,
      CryptoBoard: true,
    }
  },
  savedGraphs: JSON.parse(window.localStorage.getItem('savedGraphs')) || [],
};