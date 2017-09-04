import '../scss/index.scss';

const model = {
    currentPriceURL: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    historicalPriceURL: 'https://api.coindesk.com/v1/bpi/historical/close.json',
    updateFrequency: 60000,
    currentPriceData: {},
    historicalPriceData: {},
    historyGraphWidth: 300,
    historyGraphHeight: 150,
    startFetchingData() {
        this.requestCurrentPriceData();
        this.intervalID = setInterval(() => {
            this.requestCurrentPriceData.bind(this);
        }, this.updateFrequency);        
    },
    requestCurrentPriceData() {     
        fetch(this.currentPriceURL)
            .then(response => response.json())
            .then(data => {
                this.currentPriceData = data;
                controller.renderCurrentPrice();
            })          
            .catch(error => console.warn(error));
    },
    requestHistoricalPriceData() {
        d3.json(this.historicalPriceURL, (data) => {            
            this.historicalPriceData = data;
            controller.renderHistoryGraph()
        })
    }
};

const currentPriceView = {
    init() {
        this.valueHolderUSD = document.querySelector('.current-price__USD .value');
        this.valueHolderEUR = document.querySelector('.current-price__EUR .value');        
        this.euroSign = '&euro;'
        this.dollarSign = '&#36;'
    },
    renderData({ rateUSD, rateEUR }) {
        this.valueHolderUSD.innerHTML = this.dollarSign + rateUSD;
        this.valueHolderEUR.innerHTML = this.euroSign + rateEUR;
    }

};

const historyGraphView = {
    init() {
        this.graphSVG = d3.select('.graph').append('svg');
    },
    renderGraph({ width, height, data }) {    
        const createDateObj = (dateStr) => {
            const dateArr = dateStr.split('-');
            const year = dateArr[0];
            const month = dateArr[1];
            const day =  dateArr[2];
            return new Date(year, month, day);
        }        
        // create an array(dataset) from an object(data)
        const dataset = [];
        const keys = Object.keys(data);
        keys.forEach(key => {    
            dataset.push({
                time: createDateObj(key),
                currencyValue: data[key]
            });
        });

        const xScale = d3.scaleLinear()
                         .domain([
                             d3.min(dataset, d => d.time.getTime()),
                             d3.max(dataset, d => d.time.getTime())
                         ])
                         .range([0, width]);

        const yScale = d3.scaleLinear()
                         .domain([
                             0,
                             d3.max(dataset, d => d.currencyValue)
                         ])
                         .range([height, 0]);
        
        const lineFunction = d3.line()
                               .x(d => xScale(d.time.getTime()))
                               .y(d => yScale(d.currencyValue))
                               .curve(d3.curveBasis);


                                 
        this.graphSVG
            .attrs({
                width,
                height
            })
            .append('path')
              .attrs({
                'd': lineFunction(dataset),
                'stroke': '#F51455',
                'stroke-width': 2,
                'fill': 'none'
            });
    }
}

const controller = {
    init() {
        historyGraphView.init();
        model.requestHistoricalPriceData();
        model.startFetchingData();
        currentPriceView.init();
        
    },
    renderCurrentPrice() {
      const rateEUR = model.currentPriceData.bpi.EUR.rate;
      const rateUSD = model.currentPriceData.bpi.USD.rate;
      currentPriceView.renderData({
          rateEUR,
          rateUSD
      });
    },
    renderHistoryGraph() {
       //model.historicalPriceData
       const width = model.historyGraphWidth;
       const height = model.historyGraphHeight;
       const data = model.historicalPriceData.bpi; // object
       historyGraphView.renderGraph({
           width,
           height,
           data
       });
    }

};

controller.init();