import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';
import { interpolatePath } from 'd3-interpolate-path';
import flatpickr from 'flatpickr';
import '../scss/index.scss';
import 'flatpickr/dist/themes/material_green.css';



const model = {
    currentPriceURL: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    historicalPriceURL: 'https://api.coindesk.com/v1/bpi/historical/close.json',
    updateFrequency: 60000,
    currentPriceData: {},
    historicalPriceData: {},
    historyGraphWidth: 500,
    historyGraphHeight: 250,
    historyGraphTicksInfo: {
      'all-time': {
         xTicks: 4, // 9
         xTickFormat: '%Y',
         yTicks: 5
      },
      '1-year': {
         xTicks: 3, // 12
         xTickFormat: '%b\'%y',
         yTicks: 4
      },
      '6-month': {
         xTicks: 3, // 6
         xTickFormat: "%b\'%y",
         yTicks: 5
      },
      '3-month': {
         xTicks: 3, // 3
         xTickFormat: '%b\'%y',
         yTicks: 5
      },
      '1-month': {
         xTicks: 3, // 4
         xTickFormat: '%e\'%b',
         yTicks: 4
      },
      '1-week': {
         xTicks: 3, // 7
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
    hashTable: {},
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
            const day =  dateArr[2]; // - 1            
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
            'fill': 'none',
            'id': 'graph-line',
            //'transform': `translate(${leftShift}, 0)`
          });
      // add axises
      this.changeTicksInfo('1-month'); // timeline defalts to 1-month
      const { yTicks, xTicks } = this.determineTicks(dataset);
      const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks);
      const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTicks).tickFormat(d3.timeFormat(this.xTickFormat));

      const yAxis = this.graphSVG
                      .append('g')
                      .call(yAxisGen)
                      .attrs({
                          //'transform': `translate(${leftShift}, 0)`,
                          'class': 'y-axis'
                      });
      const xAxis = this.graphSVG
                      .append('g')
                      .call(xAxisGen)
                      .attrs({
                          'transform': `translate(0, ${height})`,
                          'class': 'x-axis'
                      });
      this.addMovableParts(dataset, height);        
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
            .duration(1000)
            .attrTween('d',  function() {
              const previous = d3.select(this).attr('d');
              const current = lineFunction(dataset);
              return interpolatePath(previous, current);
            });
      // update axises
      const { yTicks, xTicks } = this.determineTicks(dataset);
      const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks);
      const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTicks).tickFormat(d3.timeFormat(this.xTickFormat));

      const yAxis = this.graphSVG
                      .selectAll('g.y-axis')
                      .transition()
                      .duration(1000)
                      .call(yAxisGen)

      const xAxis = this.graphSVG
                      .selectAll('g.x-axis')
                      .transition()
                      .duration(1000)
                      .call(xAxisGen);
                      
      this.createHashTable(dataset);
    },
    determineTicks(dataset) {
      // recursivly finds averages
      const formTicksArray = ({ finalLevel, level, prevSm, prevLg }) => {
        let outputArray = [ prevSm, prevLg ];

        if(level >= finalLevel) {
          return;
        }
        const currTick = (prevLg + prevSm) / 2;
        outputArray.push(currTick);

        ++level;
        const  valuesDown = formTicksArray({
          finalLevel,
          level,
          prevSm: currTick,
          prevLg
        });
        const valuesUp = formTicksArray({
          finalLevel,
          level,
          prevSm,
          prevLg: currTick
        })
        if(valuesDown) {
          outputArray = [ ...new Set([...outputArray, ...valuesDown]) ];
        }
        if(valuesUp) {
          outputArray = [ ...new Set([...outputArray, ...valuesUp]) ];
        }
        return outputArray;
      }

      let prevLarger = d3.max(dataset, d=> d.currencyValue);
      let prevSmaller = d3.min(dataset, d => d.currencyValue);
      const yTicks = formTicksArray({
        finalLevel: Math.round((this.yTicks - 2) / 2),
        level: 0,
        prevSm: prevSmaller,
        prevLg: prevLarger
      });
      
      prevSmaller = dataset[0].time.getTime();
      prevLarger = dataset[dataset.length - 1].time.getTime();
      const xTicks = formTicksArray({
        finalLevel: this.xTicks,
        level: 1,
        prevSm: prevSmaller,
        prevLg: prevLarger
      }); 
      return {
        yTicks,
        xTicks
      };
    },
    createHashTable(dataset) {
      const hashTable = {};
      dataset.forEach(item => {
        hashTable[Math.round(this.xScale(item.time.getTime()))] = {
          currencyValue: item.currencyValue,
          time: item.time,
        }
      });      
      controller.setNewHashTable(hashTable);      
    },
    addMovableParts(dataset, height) {
      this.createHashTable(dataset);        

      const lineFunction =
        d3.line()
          .x(d => 0)
          .y(d => this.yScale(d.currencyValue));
      
      this.graphSVG
        .append('path')
        .attrs({
          'd': lineFunction(dataset),
          'stroke': '#717A84',
          'stroke-width': 2,
          'fill': 'none',
          'id': 'movable',
          'transform': `translate(0, 0)`,
        });


      const cutLastNChars = (str, n) => {
        if(str.length > n) {
          return str.substr(0, str.length - n);
        } else {
          console.warn('cutLastNChars: n is to large!');
        }
      }
      const hideMovablePart = () => {
        d3.select('#movable')
        .attrs({
          'transform': `translate(-999, 0)`,          
        })
        /*.transition()
        .duration(500)
        .style('opacity', '0');*/
        this.hideDotsAndTooltip();
      }


      this.graphSVG
        .on('mousemove', () => {
          const marginLeft = d3.select('.graph').node().offsetLeft;
          const graphSVGStyles = getComputedStyle(this.graphSVG.node());
          let paddingLeft = graphSVGStyles.paddingLeft;
          paddingLeft = +(cutLastNChars(paddingLeft, 2)); // getting rid of 'px' part

          const xPos = d3.event.clientX - marginLeft - paddingLeft;          
          const value = controller.getHashValue(xPos);
          if(!!value) {
            this.showDotsAndTooltip(Object.assign(value));
          } else {
            this.hideDotsAndTooltip();
          }          
          d3.select('#movable')
            .attrs({              
              'transform': `translate(${xPos}, 0)`,
            })            
            //.style('opacity', 1);

          let graphWidth = graphSVGStyles.width;  
          graphWidth = +(cutLastNChars(graphWidth, 2));          
          // if movable reaches the end of a graph-line
          if(xPos > graphWidth ||
             xPos < 0
          ) {                      
            hideMovablePart();
          }
        })
        .on('mouseout', () => {
          hideMovablePart();
        });

      this.tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      this.dot = d3.select('#historical-data').append('circle')
        .attrs({
          r: 5,
          'class': 'dot',
          'fill': '#1bbc9b'
        })            
        .style('opacity', 0);
    },
    showDotsAndTooltip({ time, currencyValue }) {
      d3.selectAll('.dot')
        .attrs({
          cy: this.yScale(currencyValue),
          cx: this.xScale(time.getTime())
        })
        .transition()
        .duration(100)
        .style('opacity', 0.9);
        
        const currencySign = controller.getCurrencySign(this.currency)
        const { year, month, day } = this.formProperDateValue({
          year: time.getFullYear(),
          month: time.getMonth(),
          day: time.getDate()
        });

        this.tooltip
          .transition()
          .duration(100)
          .style('opacity', 0.75)

        const graph = d3.select('.graph').node();
        
        this.tooltip.html(
          `<h4>${this.formProperDateFormat(year, month, day)}</h4>
           <strong>Price: ${currencySign + currencyValue.toFixed(2)}</strong>`
          )
          .style('left', this.xScale(time.getTime()) + graph.offsetLeft + 'px')
          .style('top', this.yScale(currencyValue) + graph.offsetTop - 5 + 'px')
    },
    hideDotsAndTooltip() {
      d3.selectAll('.dot')         
      .transition()
      .duration(100)
      .style('opacity', 0);                        
    
      this.tooltip.transition()
        .duration(100)
        .style('opacity', 0)         
    },
    changeTicksInfo(timeline) {
      const ticksDataObj = controller.getHistoryGraphTicksInfo(timeline);
      if(!!ticksDataObj) {
        this.xTicks = ticksDataObj.xTicks;      
        this.xTickFormat = ticksDataObj.xTickFormat;
        this.yTicks = ticksDataObj.yTicks;
      }
      console.log(timeline, this.yTicks, this.xTickFormat, this.xTicks);
    },
    createCurrDate(params) { // JS DATE (0-INDEXED)
      let today;
      if(!!params) {
        const { year, month, day } = params;
        today = new Date(year, month, day);
      } else {
        today = new Date();
      }

      return {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate()
      };
    },
    formProperDateValue({ yearSubtr, monthSubtr,  daySubtr, year, month, day }) { // API DATE (1-INDEXED)
      // Subtr === subtractor
      const currentDate = this.createCurrDate();
      let prevMonthsAmontOfDays;

      if(!year) {
        year = currentDate.year;
      }
      if(!month) {
        month = currentDate.month;
      }
      if(!day) {
        day = currentDate.day;
      }

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
          prevMonthsAmontOfDays = new Date(year, month, 0).getDate();
          const additionalDays = daySubtr - day;
          day = prevMonthsAmontOfDays - additionalDays;
        } else {
          day -= daySubtr;
        }
      }

      if(!prevMonthsAmontOfDays) {
        prevMonthsAmontOfDays = new Date(year, month, 0).getDate();
      }
      if(day !== prevMonthsAmontOfDays) {
        day += 1;
      } else {
        day = 1;
      }
      if(month  !== 12) {
        month += 1;
      } else {
        month = 0;
      }

      return {
          year,
          month,
          day,
      };
    },
    formProperDateFormat(year, month, day) { // example: turns (2017, 5, 14) into 2017-05-15    
      const dateStr = `${year}-${month < 10 ? ('0' + month) : month}-${day < 10 ? ('0' + day) : day}`;        
      return dateStr;
    },
    attachEventsForFilters() {
      this.prevBtn = d3.select('.button[data-timeline="1-month"]').node();
      d3.selectAll('.filters .button')
        .on('click', () => {
          d3.event.preventDefault();      
          const btn = d3.event.target;
          if(btn !== this.prevBtn) {
            this.prevBtn.classList.remove('selected');
            btn.classList.add('selected');
            this.prevBtn = btn;
            this.timelineButtonClick.call(this)
          }
        });
      d3.select('#currencies')
        .on('change', this.currencyDropdownChange.bind(this));
      this.initCalendar();
    },
    timelineButtonClick() {
      const timeline = d3.event.target.getAttribute('data-timeline');
      
      //current day          
      const { year, month, day } = this.formProperDateValue({});

      let startDate;
      switch(timeline) {
        case 'all-time':
          startDate = this.createCurrDate({ year: 2010, month: 7, day: 17 });
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
      // change ticks specifier
      this.changeTicksInfo(timeline)
      // update timeline filter
      this.end = this.formProperDateFormat(year, month, day); // current date
      this.start = this.formProperDateFormat(startDate.year,startDate.month,startDate.day);
      // apply all filters and get proper url
      const url = this.applyFilters();
      controller.updateHistoricalDataRequest(url);
    },
    currencyDropdownChange() {     
        this.currency  = d3.event.target.value;
        // apply all filters and get proper url
        const url = this.applyFilters();
        controller.updateHistoricalDataRequest(url);      
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
    },
    initCalendar() {
      const { year, month, day } = this.createCurrDate();      
      const inputs = document.querySelectorAll('.flatpickr-target');
      inputs[0].placeholder = this.start;
      inputs[1].placeholder = this.end;
      flatpickr(inputs, {
        allowInput: true,
        enable: [
          {
              from: "2010-07-17",
              to: this.formProperDateFormat(year,month + 1, day)
          }
        ],
        onChange(selectedDates, dateStr, instance) {
          const self = historyGraphView;
          self.changeTicksInfo('custom');          
          self.prevBtn.classList.remove('selected');
          if(startInput === instance) {
            self.start = dateStr;
          } else { // endInpt === instance
            self.end = dateStr;
          }          
          if(self.end > self.start) {
            const url = self.applyFilters();
            controller.updateHistoricalDataRequest(url);
          }
        }
      });      
      const startInput = inputs[0]._flatpickr;
      const endInput = inputs[1]._flatpickr;      
    },
};

const controller = {
    init() {
        const url = historyGraphView.setDefaultFilters();
        model.requestHistoricalPriceData(url, false);
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
    },
    getCurrencySign(currencyName) {    
      return model.currencySigns[currencyName];
    },
    getHistoryGraphTicksInfo(timeline) {
      return model.historyGraphTicksInfo[timeline];
    },
    setNewHashTable(hashTable) {
      model.hashTable = {};
      model.hashTable = Object.assign({}, hashTable);
    },
    getHashValue(key) {
      return model.hashTable[key];
    }
};

controller.init();