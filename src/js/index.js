import '../scss/index.scss';

const model = {
    currentPriceURL: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    historicalPriceURL: 'https://api.coindesk.com/v1/bpi/historical/close.json',
    updateFrequency: 60000,
    currentPriceData: {},
    historicalPriceData: {},
    historyGraphWidth: 400,
    historyGraphHeight: 250,
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
    requestHistoricalPriceData(url, isGraphBeingUpdated) {
        d3.json(url, (data) => {      
            this.historicalPriceData = data;
            controller.renderHistoryGraph(isGraphBeingUpdated)
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
    renderGraph({ width, height, data, isGraphBeingUpdated }) {
        // transforms a string into a Date object
        
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

        if(isGraphBeingUpdated) {
          this.updateLine({
            dataset,
            width,
            height
          });
        } else {
          this.buildLine({
            dataset,
            width,
            height
          });
          this.attachEventsForFilters();
        }        
    },
    updateLine({ dataset, width, height }) {
      // dataset has changd, need to update graph
      this.graphSVG = d3.select('.graph').select('svg#historical-data');

      const firstDate = dataset[0].time.getTime();
      const lastDate = dataset[dataset.length - 1].time.getTime();
      const xScale = d3.scaleLinear()
                       .domain([
                         firstDate,
                         lastDate
                       ])
                       .range([0, width]);

      const yScale = d3.scaleLinear()
                       .domain([
                         d3.min(dataset, d => d.currencyValue),
                         d3.max(dataset, d => d.currencyValue)
                       ])
                       .range([height, 0]);

      const lineFunction = d3.line()
                             .x(d => xScale(d.time.getTime()))
                             .y(d => yScale(d.currencyValue))
                             //.curve(d3.curveBasis);
      // constructed basic graph
      this.graphSVG
        .attrs({
          width,
          height
        })
        .select('path')
          .attrs({
            'd': lineFunction(dataset)           
          });

      // add axises
      const yAxisGen = d3.axisLeft(yScale).ticks(4);
      const xAxisGen = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%e')).ticks(dataset.length);
      
      const padding = 20; // random number    

      const yAxis = this.graphSVG
                      .selectAll('g.y-axis')
                      .call(yAxisGen)

      const xAxis = this.graphSVG
                      .selectAll('g.x-axis')
                      .call(xAxisGen)
      
        
      console.log(this.graphSVG.selectAll('circle'));
      this.graphSVG.selectAll('circle')
                   .data(dataset)
                   .attrs({
                    cx: d => xScale(d.time.getTime()),
                    cy: d => yScale(d.currencyValue)            
                   });
    },
    buildLine({ dataset, width, height }) {
        const firstDate = dataset[0].time.getTime();
        const lastDate = dataset[dataset.length - 1].time.getTime();
        const xScale = d3.scaleLinear()
                         .domain([
                           firstDate,
                           lastDate                           
                         ])
                         .range([0, width]);

        const yScale = d3.scaleLinear()
                         .domain([
                           d3.min(dataset, d => d.currencyValue),
                           d3.max(dataset, d => d.currencyValue)
                         ])
                         .range([height, 0]);

        const lineFunction = d3.line()
                               .x(d => xScale(d.time.getTime()))
                               .y(d => yScale(d.currencyValue))
                               //.curve(d3.curveBasis);
                

        this.graphSVG = d3.select('.graph').append('svg');
        // constructed basic graph
        this.graphSVG
          .attrs({
            width,
            height,
            id: 'historical-data',
          })   
          .append('path')
            .attrs({
              'd': lineFunction(dataset),
              'stroke': '#C2390D',
              'stroke-width': 2,
              'fill': 'none'
            });

        // add axises
        const yAxisGen = d3.axisLeft(yScale).ticks(4);
        const xAxisGen = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%e')).ticks(dataset.length);
        
        const padding = 20; // random number

        const yAxis = this.graphSVG
                        .append('g')
                        .call(yAxisGen)
                        .attrs({
                            'transform': `translate(${padding* 1.2}, ${-padding * (1.15)})`,
                            'class': 'y-axis'
                        });

        const xAxis = this.graphSVG
                        .append('g')
                        .call(xAxisGen)                        
                        .attrs({
                            'transform': `translate(${padding}, ${height - padding})`,
                            'class': 'x-axis'
                        });

        // dots represent single smallest time duration    
        const tooltip = d3.select('body').append('div')
                          .attr('class', 'tooltip')
                          .style('opacity', 0);
         
        this.graphSVG.selectAll('circle')
                       .data(dataset)
                       .enter()
                       .append('circle')
                         .attrs({
                            cx: d => xScale(d.time.getTime()),
                            cy: d => yScale(d.currencyValue),
                            r: 5,
                            'fill': '#32B9B5'
                          }) // add tooltip on hover
                       .on('mouseover', function(d) {
                           // add some animation for dots later
                         tooltip.transition()
                           .duration(100)
                           .style('opacity', 0.75)
                         tooltip.html(`<strong>Price: $${d.currencyValue}</strong>`)
                           .style('left', (d3.event.pageX) + 'px')
                           .style('top', (d3.event.pageY) + 'px')                     
                       }) // remove tooltip on hover
                       .on('mouseout', () => {
                         tooltip.transition()
                           .duration(300)
                           .style('opacity', 0);
                       })


    },
    attachEventsForFilters() {
      d3.selectAll('.buttons button')
        .on('click', () => {
          d3.event.preventDefault();
          
        });
      
      d3.select('#currencies')
        .on('change', () => {            
            const url = controller.getHistoricalPriceURL() + '?currency=' + d3.event.target.value;            
            controller.updateHistoricalDataRequest(url);
        });

      d3.select('.manual-date')
        .on('submit', () => {
            d3.event.preventDefault();            
        });
    }

}

const controller = {
    init() {
        //historyGraphView.init();
        model.requestHistoricalPriceData(model.historicalPriceURL, false);
        model.startFetchingData();
        currentPriceView.init();
        
    },
    updateHistoricalDataRequest(url) {
      // this funtion will be called inside a view
      model.requestHistoricalPriceData(url, true);
    },
    renderCurrentPrice() {
      const rateEUR = model.currentPriceData.bpi.EUR.rate;
      const rateUSD = model.currentPriceData.bpi.USD.rate;
      currentPriceView.renderData({
          rateEUR,
          rateUSD
      });
    },
    renderHistoryGraph(isGraphBeingUpdated) {
       //model.historicalPriceData
       const width = model.historyGraphWidth;
       const height = model.historyGraphHeight;
       const data = model.historicalPriceData.bpi; // object
       historyGraphView.renderGraph({
           width,
           height,
           data,
           isGraphBeingUpdated
       });
    },
    getHistoricalPriceURL() {
      // this funtion will be called inside a view
      return model.historicalPriceURL;
    }

};

controller.init();