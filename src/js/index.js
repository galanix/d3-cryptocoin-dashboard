import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';
import { interpolatePath } from 'd3-interpolate-path';
import flatpickr from 'flatpickr';
import '../scss/index.scss';
import 'flatpickr/dist/themes/material_green.css';

const model = {
  // subobjects thatstore data
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
    data: {},
    hashTable: {},
    width: 500,
    height: 250,
    ticksInfo: {
      'from-all-time-to-year': {
          xTicks: 4,
          xTickFormat: '%Y',
          yTicks: 3
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
    }
  },
  currencyPair: {
    data: {},
    width: 500,
    height: 250,
  },
  // methods
  startFetchingData() {
      this.requestCurrentPriceData();
      this.intervalFetch = setInterval(() => {
          this.requestCurrentPriceData.call(this);
      }, this.currentPrice.updateFrequency);
  },
  requestCurrentPriceData() {
    fetch(this.currentPrice.url)
      .then(response => response.json())
      .then(data => {
          this.currentPrice.data = data;
          controller.renderCurrentPrice();
      })
      .catch(error => console.warn(error));
  },
  requestGraphData({ url, isGraphBeingUpdated, callback, objectToAssignTo }) {
    controller.startAnimation(); // shows something while data travels
    d3.json(url, (data) => {
        objectToAssignTo.data = data;
        callback(isGraphBeingUpdated);
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
    this.valueHolderEUR.style.transition = 'all .5s ease-in';
    this.valueHolderUSD.style.transition = 'all .5s ease-in';
    
    const highlightColor = '#C2390D';
    const blackColor = '#000';

    const setStyle = (styles) => {
      const props = Object.keys(styles);
      props.forEach(prop => {
        this.valueHolderUSD.style[prop] = styles[prop];
        this.valueHolderEUR.style[prop] = styles[prop];
      })
    };

    setStyle({      
      color: highlightColor
    });
    
    setTimeout(() => {
      setStyle({      
        color: blackColor
      })
    }, 2500);

    this.valueHolderUSD.innerHTML = controller.getCurrencySign('USD') + this.formatNumber(rateUSD);
    this.valueHolderEUR.innerHTML = controller.getCurrencySign('EUR') + this.formatNumber(rateEUR);
  },
  formatNumber(number) {
    return (+number.replace(',', '')).toFixed(2);
  }
};

const historyGraphView = {
  init() {
    // set default filters( they are changed by buttons/dropdown/input)
    const today = new Date();
    const startDate = new Date();
    this.end = this.formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate());
    this.start = this.formProperDateFormat(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());     
    this.currency = 'USD';  
    return this.applyFilters();
  },
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

    this.graphSVG = d3.select('.graph--bitcoin-rate').append('svg');
    
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
          'id': 'graph-line--main',
          //'transform': `translate(${5}, 0)`
        });
    // add axises
    this.changeTicksInfo('less-than-3-month'); // timeline defalts to 1-month      
    const { yTicks, xTicks } = this.determineTicks(dataset);      
    const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks).tickFormat(d3.format('.2f'));
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
    this.drawCurrencySign();
    this.addMovableParts(dataset, height);
  },
  updateLine({ dataset, width, height }) {
    // dataset has changed, need to update #historical-data graph      
    this.graphSVG = d3.select('.graph--bitcoin-rate').select('svg#historical-data');
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
            return interpolatePath(previous, current); // adds/removes points from prev to match current => for better graph transformations
          });
    // update axises
    const { yTicks, xTicks } = this.determineTicks(dataset);
    const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks).tickFormat(d3.format('.2f'));
    const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTicks).tickFormat(d3.timeFormat(this.xTickFormat));      

    const yAxis = this.graphSVG
                    .selectAll('g.y-axis')
                    .transition()
                    .duration(1000)
                    .call(yAxisGen);

    const xAxis = this.graphSVG
                    .selectAll('g.x-axis')
                    .transition()
                    .duration(1000)
                    .call(xAxisGen);

    this.drawCurrencySign();
    this.createHashTable(dataset);
  },
  drawCurrencySign() {
    const yAxis = d3.select('g.y-axis');

    if(!yAxis.select('g.currency-sign').node()) {        
      yAxis
      .append('g')
      .attrs({
        'class': 'currency-sign',
      })
      .append('text')
        .attrs({
          'fill': '#000',
          'font-size': '18',
          'x': '4',
          'y': '-10'
        });
    }
    const text = d3.select('.currency-sign text');      
    text
      .transition()
      .duration(500)
      .attrs({
        y: '-100'
      });
    setTimeout(() => {
      text
        .transition()
        .duration(500)
        .attrs({
          y: '-10'
        })
        .node().innerHTML = controller.getCurrencySign(this.currency);
    }, 500);
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
      this.hideDotsAndTooltip();
    }


    this.graphSVG
      .on('mousemove', () => {
        const marginLeft = d3.select('.graph--bitcoin-rate').node().offsetLeft;
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
          });     

        let graphWidth = graphSVGStyles.width;
        graphWidth = +(cutLastNChars(graphWidth, 2));          
        // if movable reaches the end of a graph-line
        if(xPos > graphWidth + 5 || // 5s are added for padding
            xPos < -5
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

      const graph = d3.select('.graph--bitcoin-rate').node();
      
      this.tooltip.html(
        `<h4>${this.formProperDateFormat(time.getFullYear(), time.getMonth() + 1, time.getDate())}</h4>
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
    d3.selectAll('.filters--bitcoin-rate .button')
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
    controller.updateGraphData({ 
      url,
      objectToAssignTo: model.history, 
      callback: controller.renderHistoryGraph 
    });
  },
  currencyDropdownChange() {
      this.currency  = d3.event.target.value;
      // apply all filters and get proper url
      const url = this.applyFilters();     
      controller.updateGraphData({ 
        url,
        objectToAssignTo: model.history, 
        callback: controller.renderHistoryGraph 
      });
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
          controller.updateGraphData({ 
            url,
            objectToAssignTo: model.history, 
            callback: controller.renderHistoryGraph 
          });
        }
      }
    });
    const startInput = inputs[0]._flatpickr;
    const endInput = inputs[1]._flatpickr;      
  },
  showWaitMessage() {
    if(!this.message) {
      this.message = document.querySelector('.graph--bitcoin-rate .wait-message');
    }
    this.message.style.opacity = 0.75;
  },
  hideWaitMessage() {
    this.message.style.opacity = 0;
  }
};

const currencyPairGraphsView = {
  init() {
    const pairName = 'BTCLTC';
    const hours = 2;
    const dataPoints = 120;
    controller.setCurrencyPairFilters({
      pairName,
      hours,
      dataPoints
    });
  },
  renderGraph({ width, height, data, isGraphBeingUpdated }) {
    const dataset = data;

    // NOT DRY
    if(isGraphBeingUpdated) { // substitute dataset and update current graphs(max3)
      this.updateLines({
        dataset,
        width,
        height
      });
    } else {
      this.buildLines({ // build new graphs from scratch and add event listeners for filters
        dataset,
        width,
        height
      });
      this.attachEventsForFilters();
    }
  },
  updateLines({ dataset, width, height }) {
    console.log(dataset);
  },
  buildLines({ dataset, width, height }) {
    const firstDate = new Date(dataset[0].created_on).getTime();
    const lastDate = new Date(dataset[dataset.length - 1].created_on).getTime();
    console.log(dataset.length);
    this.graphSVG = d3.select('.graph--currency-pair').append('svg');

    /*
       WIDTH, HEIGHT AS PARAMETERS OR THROUGH SEPARATE CONTROLLER FUNTION?
    */
    this.xScale = d3.scaleLinear()
                      .domain([
                        firstDate,
                        lastDate
                      ])
                      .range([0, width]);


    this.yScale = d3.scaleLinear()
                    .domain([
                      d3.min(dataset, d => (+d.ticker.ask) - (+d.ticker.bid) - 100), // +d.ticker.bid
                      d3.max(dataset, d => +d.ticker.ask + 100) // TEMP
                    ])
                    .range([height, 0]);

    // encapsulate graph types in namespaces (objects)
    // DO I NEED THESE IN OTHER METHODS?

    this.ask = {
      type: 'ask',
      color: '#3498DB',
      lineFunction:  d3.line()
                       .x(d => this.xScale(new Date(d.created_on).getTime()))
                       .y(d => this.yScale(+d.ticker.ask)),
    };

    this.bid = {
      type: 'bid',
      color: '#E74C3C',      
      lineFunction: d3.line()
                      .x(d => this.xScale(new Date(d.created_on).getTime()))
                      .y(d => this.yScale(+d.ticker.bid))
    };

    this.spread = {
      type: 'spread',
      color: '#2ECC71',              
      lineFunction: d3.line()
                      .x(d => this.xScale(new Date(d.created_on).getTime()))
                      .y(d => this.yScale((+d.ticker.ask) - (+d.ticker.bid)))
    };
 
    const appendLineOfType = (typeObj) => {
      this.graphSVG
        .append('path')
          .attrs({
            'd': typeObj.lineFunction(dataset),
            'stroke': typeObj.color,
            'stroke-width': 2,
            'fill': 'none',
            'id': 'graph-line--' + typeObj.type,
          });
    };

    this.graphSVG
      .attrs({
        width,
        height,
        id: 'currency-pair',
      }) // construct 3 basic graphs
    
    appendLineOfType(this.ask); // ask-graph
    appendLineOfType(this.bid); // bid-graph
    appendLineOfType(this.spread); // spread-graph
    
    // add axises
    // ONLY ONE PAIR OF AXISES
    const yAxisGen = d3.axisLeft(this.yScale); // bid or ask?
    const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat('%H:%M'));

    const yAxis = this.graphSVG
                    .append('g')
                    .call(yAxisGen)
                    .attrs({
                        'class': 'y-axis'
                    });
    const xAxis = this.graphSVG
                    .append('g')
                    .call(xAxisGen)
                    .attrs({
                        'transform': `translate(0, ${height})`,
                        'class': 'x-axis'
                    });
  },
  attachEventsForFilters() {
    d3.selectAll('.displayed-graphs input')
      .on('change', () => this.hideGraph());

    d3.selectAll('#cryptocoin-codes')
      .on('change', () => this.changePairName());

    d3.selectAll('.hours-input')
      .on('submit', () => this.changeHours());

    d3.selectAll('#data-points-frequency')
      .on('change', () => this.changeDataPointsFreq());   
  },
  hideGraph() {
    const id = d3.event.target.id;
    const opacityVal = d3.event.target.checked === true ? 1 : 0;    
    d3.select('#graph-line--' + id)
      .transition()
      .duration(400)
      .style('opacity', opacityVal);
  },
  changePairName() {   
    const pairName = d3.event.target.value;    
    this.applyFilterChange({ pairName });
  },
  changeHours() {
    d3.event.preventDefault();
    const input = d3.event.target.querySelector('#hours');
    const hours = input.value;
    input.placeholder = hours;
    input.value = '';
    input.blur();

    this.applyFilterChange({ hours });
  },
  changeDataPointsFreq() {
    const hours = controller.getModelData({
      namespace: 'currencyPair',
      prop: 'hours'
    })    
    
    const frequency = d3.event.target.value;
    let divider;
    switch(frequency) {
      case "1 min":
        divider = 0.0167;
        break;
      case "5 mins":
        divider = 0.0833;
        break;
      case "10 mins":
        divider = 0.1667;
        break;
      case "30 mins":
        divider = 0.5;
        break;
      case "1 hour":
        divider = 1;
        break;
      case "3 hours":
        divider = 3;
        break;
      case "6 hours":
        divider = 6;
        break;
      case "12 hours":
        divider = 12;
        break;
      case "24 hours":
        divider = 24;
        break;
      default:
        console.warn('unknown frequency');
    }
    const dataPoints = Math.round(hours / divider);
    this.applyFilterChange({ dataPoints });
  },
  applyFilterChange(propertiesToChange) {
    controller.setCurrencyPairFilters(propertiesToChange);
    
    const url =  controller.createCurrencyPairURL();    
    controller.updateGraphData({
      url,
      objectToAssignTo: model.currencyPair,
      callback: controller.renderCurrencyPairGraph
    });    
  }
};

const controller = {
    init() {
      // request data for history graph
      model.requestGraphData({
        url: historyGraphView.init(),
        isGraphBeingUpdated: false,
        objectToAssignTo: model.history,
        callback: this.renderHistoryGraph,
      });

      // request data for currency pair graph
      currencyPairGraphsView.init();      
      model.requestGraphData({
        url: this.createCurrencyPairURL(),
        isGraphBeingUpdated: false,
        objectToAssignTo: model.currencyPair,
        callback: this.renderCurrencyPairGraph,
      });

      model.startFetchingData();
      currentPriceView.init();
    },
    updateGraphData({ url, objectToAssignTo, callback }) {
      // this funtion will be called inside a view
      model.requestGraphData({
        url,
        isGraphBeingUpdated: true,
        objectToAssignTo,
        callback
      });
    },
    renderCurrentPrice() {
      const rateEUR = model.currentPrice.data.bpi.EUR.rate;
      const rateUSD = model.currentPrice.data.bpi.USD.rate;
      currentPriceView.renderData({
          rateEUR,
          rateUSD
      });
    },
    renderHistoryGraph(isGraphBeingUpdated) {
       const { width, height , data } = model.history;
       historyGraphView.renderGraph({
           width,
           height,
           data: data.bpi,
           isGraphBeingUpdated
       });
    },
    renderCurrencyPairGraph(isGraphBeingUpdated) {
      const { width, height, data } = model.currencyPair;      
      currencyPairGraphsView.renderGraph({
        width,
        height,
        data,
        isGraphBeingUpdated
      });
    },
    getHistoricalPriceURL() {
      // this funtion will be called inside a view
      return model.history.url;
    },
    getCurrencySign(currencyName) {
      return model.general.currencySigns[currencyName];
    },
    getHistoryGraphTicksInfo(timeline) {
      return model.history.ticksInfo[timeline];
    },
    setNewHashTable(hashTable) {
      //model.history.hashTable = {};
      model.history.hashTable = Object.assign({}, hashTable);
    },
    getHashValue(key) {
      return model.history.hashTable[key];
    },
    startAnimation() {
      historyGraphView.showWaitMessage();
    },
    finishAnimation() {
      historyGraphView.hideWaitMessage();
    },
    setCurrencyPairFilters(params) {      
      const props = Object.keys(params);
      props.forEach(prop => {
        model.currencyPair[prop] = params[prop];
      });
    },
    createCurrencyPairURL() {
      const { pairName, dataPoints, hours } = model.currencyPair;
      return `https://api.nexchange.io/en/api/v1/price/${pairName}/history/?data_points=${dataPoints}&format=json&hours=${hours}`;
    },
    getModelData({ namespace, prop }) {
      if(!!model[namespace]) {        
        return model[namespace][prop];
      }
    }
};

controller.init();