import '../scss/index.scss';

const model = {
    currentPriceURL: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    updateFrequency: 60000,
    currentPriceData: {},
    startFetchingData() {
        this.requestCurrentPriceData();
        this.intervalID = setInterval(() => {
            this.requestCurrentPriceData.bind(this);
            console.log('boom, updated');
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

const controller = {
    init() {
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
    }

};

controller.init();