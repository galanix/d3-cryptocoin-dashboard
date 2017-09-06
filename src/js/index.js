import flatpickr from 'flatpickr';
import '../scss/index.scss';
import 'flatpickr/dist/themes/material_green.css';



const model = {
    currentPriceURL: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    historicalPriceURL: 'https://api.coindesk.com/v1/bpi/historical/close.json',
    updateFrequency: 60000,
    currentPriceData: {},
    historicalPriceData: {},
    historyGraphWidth: 400,
    historyGraphHeight: 250,
    historyGraphTicksInfo: {
      'all-time': {
         xTicks: 9,
         xTickFormat: '%Y',
         yTicks: 5
      },
      '1-year': {
         xTicks: 12,
         xTickFormat: '%b',
         yTicks: 3
      },
      '6-month': {
         xTicks: 6,
         xTickFormat: "%b\'%y",
         yTicks: 5
      },
      '3-month': {
         xTicks: 3,
         xTickFormat: '%b\'%y',
         yTicks: 4
      },
      '1-month': {
         xTicks: 4,
         xTickFormat: '%e\'%b',
         yTicks: 4
      },
      '1-week': {
         xTicks: 7,
         xTickFormat: '%e\'%b',
         yTicks: 4
      },
    },
    currencySigns: {
        EUR: '&#8364;',
        USD: '&#36;',
        UAH: '&#8372;',
        RUB: '&#8381;'
    },
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
            console.log(data);
            controller.renderHistoryGraph(isGraphBeingUpdated)
        })
    }
};

const currentPriceView = {
    init() {
        this.valueHolderUSD = document.querySelector('.current-price__USD .value');
        this.valueHolderEUR = document.querySelector('.current-price__EUR .value');        
        
    },
    renderData({ rateUSD, rateEUR }) {
        this.valueHolderUSD.innerHTML = controller.getCurrencySign('USD') + rateUSD;
        this.valueHolderEUR.innerHTML = controller.getCurrencySign('EUR') + rateEUR;
    }
};

const historyGraphView = {
    renderGraph({ width, height, data, isGraphBeingUpdated }) {
        // transforms a string into a Date object
        
        const createDateObj = (dateStr) => {            
            const dateArr = dateStr.split('-');
            const year = dateArr[0];
            const month = dateArr[1] - 1;
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

        if(isGraphBeingUpdated) { // substitute dataset and update current graph
          this.updateLine({
            dataset,
            width,
            height
          });
        } else {
          this.buildLine({ // build new graph from scratch and add event listeners for filters
            dataset,
            width,
            height
          });
          this.attachEventsForFilters();
        }        
    },
    updateLine({ dataset, width, height }) {
      // dataset has changed, need to update #historical-data graph
      this.graphSVG = d3.select('.graph').select('svg#historical-data');
      // data is in chronological order
      const firstDate = dataset[0].time.getTime();
      const lastDate = dataset[dataset.length - 1].time.getTime();

      this.xScale = d3.scaleLinear()
                       .domain([
                         firstDate,
                         lastDate
                       ])
                       .range([0, width]);

      this.yScale = d3.scaleLinear()
                       .domain([
                         d3.min(dataset, d => d.currencyValue),
                         d3.max(dataset, d => d.currencyValue)
                       ])
                       .range([height, 0]);

      const lineFunction = d3.line()
                             .x(d => this.xScale(d.time.getTime()))
                             .y(d => this.yScale(d.currencyValue))
                             //.curve(d3.curveBasis);
      // update basic graph
      this.graphSVG
        .attrs({
          width,
          height
        })
        .select('path')
          .transition()
          .ease(d3.easeLinear)
          .duration(1000)
          .attrs({
            'd': lineFunction(dataset)
          });

      // update axises
      const yAxisGen = d3.axisLeft(this.yScale).ticks(this.yTicks);
      const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat(this.xTickFormat)).ticks(this.xTicks);
      
      const padding = 20; // random number
      
      const yAxis = this.graphSVG
                      .selectAll('g.y-axis')
                      .call(yAxisGen);

      const xAxis = this.graphSVG
                      .selectAll('g.x-axis')
                      .call(xAxisGen);
      
        
      // update dots' position --> how to make it work for the change of amount of circles?
      /*this.graphSVG.selectAll('circle')
                   .data(dataset)                  
                   .transition()          
                   .ease(d3.easeLinear)
                   .duration(1000)
                   .attrs({
                    cx: d => xScale(d.time.getTime()), // this.
                    cy: d => yScale(d.currencyValue) // this
                   });*/
      
      this.graphSVG.selectAll('circle').remove();
      setTimeout(() => {
        this.buildScatterPlot(dataset);
        }, 1100);
    },
    buildScatterPlot(dataset) {
       // dots represent single smallest time duration        
        this.graphSVG.selectAll('circle')
          .data(dataset)
          .enter()
          .append('circle')
            .attrs({
                cx: d => this.xScale(d.time.getTime()),
                cy: d => this.yScale(d.currencyValue),
                r: 5,
                'fill': '#1bbc9b'
              }) // add tooltip on hover
          .on('mouseover', d => {
              // add some animation for dots later
            const currencySign = controller.getCurrencySign(this.currency);
            const { year, month, day } = this.formProperDateValue({});
          
            this.tooltip.transition()
              .duration(100)
              .style('opacity', 0.75)
            this.tooltip.html(`<h4>${this.formProperDateFormat(year, month, day)}</h4>
              <strong>Price: ${currencySign + d.currencyValue.toFixed(2)}</strong>`)
              .style('left', (d3.event.pageX) + 'px')
              .style('top', (d3.event.pageY) + 'px')
          }) // remove tooltip on hover
          .on('mouseout', () => {
            this.tooltip.transition()
              .duration(300)
              .style('opacity', 0);
        });
    },
    buildLine({ dataset, width, height }) {
        const firstDate = dataset[0].time.getTime();
        const lastDate = dataset[dataset.length - 1].time.getTime();
        this.xScale = d3.scaleLinear()
                         .domain([
                           firstDate,
                           lastDate                           
                         ])
                         .range([0, width]);

        this.yScale = d3.scaleLinear()
                         .domain([
                           d3.min(dataset, d => d.currencyValue),
                           d3.max(dataset, d => d.currencyValue)
                         ])
                         .range([height, 0]);

        const lineFunction = d3.line()
                               .x(d => this.xScale(d.time.getTime()))
                               .y(d => this.yScale(d.currencyValue))
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
        this.setTicksInfo('1-month'); // timeline defalts to 1-month
        const yAxisGen = d3.axisLeft(this.yScale).ticks(this.yTicks);
        const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat(this.xTickFormat)).ticks(this.xTicks);
        
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
        // build scatter plot
        
        this.tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

        this.buildScatterPlot(dataset);
    },
    setTicksInfo(timeline) {
      const ticksDataObj = controller.getHistoryGraphTicksInfo(timeline);      
      this.xTicks = ticksDataObj.xTicks;
      this.xTickFormat = ticksDataObj.xTickFormat;
      this.yTicks = ticksDataObj.yTicks;
    },
    formProperDateValue({ yearSubtr, monthSubtr,  daySubtr }) { // starts at current date a gets 1year, 1-3-6 montt, 7 days away from it (past)
      // Subtr === subtractor
      const today = new Date();
      
      let year = today.getFullYear();
      let month = today.getMonth();
      let day = today.getDate();
      if(!!yearSubtr) { // 1 year case
        year -= 1;
      }
      else if(!!monthSubtr) { // 6,3,1 month case
        if(month < monthSubtr) { 
          month += monthSubtr; // this logic may be wrong/flawed
          year -= 1;
        } else {
          month -= monthSubtr;
        }
      }
      else if(daySubtr) { // 7 days case
        if(day < daySubtr) {
          if(month !== 0) {
            month -= 1;         
          } else {
            year -= 1;
            month = 12;
          }
          // get the amount of days in the previus month
          const prevMonthsAmontOfDays = new Date(year, month, 0).getDate();
          const additionalDays = daySubtr - day;
          day = prevMonthsAmontOfDays - additionalDays;
        } else {
          day -= daySubtr;
        }
      }
      
      return {
          year,
          month: month + 1,
          day
      };
    },
    // COMEBACK
    formProperDateFormat(year, month, day) { // example: turns (2017, 5, 14) into 2017-05-15    
      const dateStr = `${year}-${month < 10 ? ('0' + month) : month}-${day < 10 ? ('0' + day) : day}`;        
      return dateStr;
    },
    attachEventsForFilters() {
      // button filters(timeline)
      d3.selectAll('.buttons button')
        .on('click', () => {
          d3.event.preventDefault();
          const timeline = d3.event.target.getAttribute('data-timeline');
          
          //current day          
          const { year, month, day } = this.formProperDateValue({});

          let startDate;
          switch(timeline) {
            case 'all-time':
              const creationDate = new Date(2010, 7, 17);
              startDate = {
                year: creationDate.getFullYear(),
                month : creationDate.getMonth(),
                day: creationDate.getDate(),
              }
              console.log(startDate.year, startDate.month, startDate.day);
              break;
            case '1-year':
              startDate = this.formProperDateValue({ yearSubtr: 1 });
              break;
            case '6-month':
              startDate = this.formProperDateValue({ monthSubtr: 6 });
              break;
            case '3-month':
              startDate = this.formProperDateValue({ monthSubtr: 3 });
              break;
            case '1-month':
              startDate = this.formProperDateValue({ monthSubtr: 1 });
              break;
            case '1-week':
              startDate = this.formProperDateValue({ daySubtr: 7 });
              break;
            default:
              console.warn('unknown timeline: ', timeline);
          }

          // change ticks specifiers
          this.setTicksInfo(timeline)
          // update timeline filter
          this.end = this.formProperDateFormat(year, month, day); // current date
          this.start = this.formProperDateFormat(startDate.year,startDate.month,startDate.day);
          // apply all filters and get proper url
          const url = this.applyFilters();
          controller.updateHistoricalDataRequest(url);
        });
      // dropdown filter(currency)
      d3.select('#currencies')
        .on('change', () => {
            this.currency  = d3.event.target.value;
            // apply all filters and get proper url
            const url = this.applyFilters();
            controller.updateHistoricalDataRequest(url);           
        });
      // input filter (date range)
      d3.select('.manual-date')
        .on('submit', () => {
            d3.event.preventDefault();
            const inputs = d3.event.target.querySelectorAll('input[type="text"]');            
            inputs[0].value = '';
            inputs[1].value = '';

        });
        // let only numbers, - and /
        d3.selectAll('.manual-date input[type="text"]')
          .on('input', () => {
            const validInputRegex = /[^0-9\/\-]+/;
            const input = d3.event.target;
            let value = d3.event.target.value;

            if(validInputRegex.test(value)) {
              input.value = value.substr(0, value.length - 1);
            }
          });
    },
    setDefaultFilters() {
      // set default filters( they are changed by buttons/drpdown/input)
      const { year, month, day } = this.formProperDateValue({});
      const startDate = this.formProperDateValue({monthSubtr: 1});
      this.end = this.formProperDateFormat(year, month, day);
      this.start = this.formProperDateFormat(startDate.year,startDate.month,startDate.day);
      this.currency = 'USD';
      return this.applyFilters();
    },
    applyFilters() {
      const entryURL = controller.getHistoricalPriceURL();
      return entryURL + `?start=${this.start}&end=${this.end}&currency=${this.currency}`;
    }
}

const controller = {
    init() {
        //historyGraphView.init();
        const url = historyGraphView.setDefaultFilters();
        model.requestHistoricalPriceData(url, false);
        model.startFetchingData();
        currentPriceView.init();
        this.initCalendar(); // calendar plugin       
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
    },
    getCurrencySign(currencyName) {    
      return model.currencySigns[currencyName];
    },
    getHistoryGraphTicksInfo(timeline) {
      return model.historyGraphTicksInfo[timeline];
    },
    initCalendar() {
      const { year, month, day } = historyGraphView.formProperDateValue({});
      flatpickr('.flatpickr-target', {
        allowInput: true,
        enable: [
          {
              from: "2010-07-17",
              to: historyGraphView.formProperDateFormat(year,month, day)
          }
        ]
      });
    }
};

controller.init();