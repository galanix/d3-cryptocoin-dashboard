import '../scss/index.scss';

const model = {
    currentPriceURL: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    updateFrequency: 60000,
    startFetchingData() {
        this.requestCurrentPriceData();
        setTimeout(this.requestCurrentPriceData, this.updateFrequency);
    },
    requestCurrentPriceData() {
        fetch(this.currentPriceURL)
            .then(response => response.json())
            .then(data => {
                this.currentPriceData = data;
                return data;
            })
            .then(sameData => console.log(this.currentPriceData))
            .catch(error => console.warn(error));
    }
}

const currentPriceView = {
    init() {}
}

const controller = {
    init() {
        model.startFetchingData();
        currentPriceView.init();
    },
    getCurrentPriceData() {
        return model.currentPriceData;
    }
};

controller.init();