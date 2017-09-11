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
      'from-all-time-to-year': {
         xTicks: 4,
         xTickFormat: '%Y',
         yTicks: 4
      },
      'from-year-to-3-month': {
        xTicks: 3,
        xTickFormat: "%b\'%y",
        yTicks: 3
      },
      'less-than-3-month': {
        xTicks: 3,
        xTickFormat: '%e\'%b',
        yTicks: 3        
      }
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
        // start animation
        controller.startAnimation();
        d3.json(url, (data) => {
            this.historicalPriceData = data;                
            controller.renderHistoryGraph(isGraphBeingUpdated)
            controller.finishAnimation();
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

const animationView = {
  init() {
    this.message = document.getElementsByClassName('waiting-message')[0];
  },
  start() {   
    this.message.style.opacity = 0.75;    
  },
  finish() {
    this.message.style.opacity = 0;    
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
            //'transform': `translate(${5}, 0)`
          })         
      // add axises
      this.changeTicksInfo('less-than-3-month'); // timeline defalts to 1-month
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
        if(!!valuesDown) {
          outputArray = [ ...new Set([...outputArray, ...valuesDown]) ];
        }

        /*if(level === finalLevel - 1 && finalLevel % 2 === 0) {
          return outputArray;
        }*/
        
        const valuesUp = formTicksArray({
          finalLevel,
          level,
          prevSm,
          prevLg: currTick
        })        
        if(!!valuesUp) {
          outputArray = [ ...new Set([...outputArray, ...valuesUp]) ];
        }
        return outputArray;
      }      

      let prevLarger = d3.max(dataset, d=> d.currencyValue);
      let prevSmaller = d3.min(dataset, d => d.currencyValue);
      const yTicks = formTicksArray({
        finalLevel: this.yTicks || 0,
        level: 1,
        prevSm: prevSmaller,
        prevLg: prevLarger
      });
            
      prevSmaller = dataset[0].time.getTime();
      prevLarger = dataset[dataset.length - 1].time.getTime();          
      const xTicks = formTicksArray({
        finalLevel: this.xTicks || 0,
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
        
        const currencySign = controller.getCurrencySign(this.currency);        

        this.tooltip
          .transition()
          .duration(100)
          .style('opacity', 0.75)

        const graph = d3.select('.graph').node();
        
        this.tooltip.html(
          `<h4>${this.formProperDateFormat(time.getFullYear(), time.getMonth(), time.getDate())}</h4>
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
            this.timelineBtnClick.call(this)
          }
        });
      d3.select('#currencies')
        .on('change', this.currencyDropdownChange.bind(this));
      this.initCalendar();
    },
    timelineBtnClick() {
      const btnValue = d3.event.target.getAttribute('data-timeline'); // button value      
      let timeline; // each of 6 buttons fall under 4 periods      
      const today = new Date();
      const startDate = new Date();

      switch(btnValue) {
        case 'all-time':
          startDate.setFullYear(2010);
          startDate.setMonth(7);
          startDate.setDate(17);
          timeline = 'from-all-time-to-year';
          break;
        case '1-year':          
          startDate.setFullYear(startDate.getFullYear() - 1)
          timeline = 'from-year-to-3-month';
          break;
        case '6-month':          
          startDate.setMonth(startDate.getMonth() - 6)
          timeline = 'from-year-to-3-month';
          break;
        case '3-month':          
          startDate.setMonth(startDate.getMonth() - 3)
          timeline = 'less-than-3-month';
          break;
        case '1-month':          
          startDate.setMonth(startDate.getMonth() - 1)
          timeline ='less-than-3-month';
          break;
        case '1-week':
          startDate.setDate(startDate.getDate() - 7);
          timeline ='less-than-3-month';
          break;
        default:
          console.warn('unknown timeline: ', btnValue);
      }
      // change ticks specifier
      this.changeTicksInfo(timeline)
      // update timeline filter
      this.end = this.formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate()); // current date
      this.start = this.formProperDateFormat(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
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
      // set default filters( they are changed by buttons/dropdown/input)
      const today = new Date();
      const startDate = new Date();      
      this.end = this.formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate());
      this.start = this.formProperDateFormat(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());     
      this.currency = 'USD';
      return this.applyFilters();
    },
    applyFilters() {
      const entryURL = controller.getHistoricalPriceURL();
      return entryURL + `?start=${this.start}&end=${this.end}&currency=${this.currency}`;
    },
    initCalendar() {
      const inputs = document.querySelectorAll('.flatpickr-target');
      let endDate = new Date();
      let startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate);
      
      inputs[0].placeholder = this.start;
      inputs[1].placeholder = this.end;

      flatpickr(inputs, {
        allowInput: true,
        enable: [
          {
              from: "2010-07-17",
              to: this.formProperDateFormat(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate())
          }
        ],
        onChange(_selectedDates, dateStr, instance) {
          const self = historyGraphView;

          self.prevBtn.classList.remove('selected');
          if(startInput === instance) {
            startDate = _selectedDates[0];
            self.start = dateStr;
          } else { // endInpt === instance
            endDate = _selectedDates[0];
            self.end = dateStr;
          }
          if(self.end > self.start) {
            let timeline;
            const monthDiff = endDate.getMonth() - startDate.getMonth();
            switch(monthDiff) {
              case 0: case 1: case 2: case 3:
                timeline = 'less-than-3-month';
                break;
              default:
                timeline = 'from-year-to-3-month';
            }
            const yearDiff = endDate.getFullYear() - startDate.getFullYear();
            if(yearDiff > 0) {
              timeline = 'from-all-time-to-year';
            }

            self.changeTicksInfo(timeline);
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
        animationView.init();
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
    },
    startAnimation() {
      animationView.start();
    },
    finishAnimation() {
      animationView.finish();
    }
};

controller.init();