import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';
import { interpolatePath } from 'd3-interpolate-path';
import flatpickr from 'flatpickr';
import '../scss/index.scss';
import 'flatpickr/dist/themes/material_green.css';

const model = {
  // namespaces
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
    },    
  },
  currencyPair: {
    data: {},
    width: 500,
    height: 250,
    dataPointDivisors: { // to get data_point we need to divide hours by these values
      "1 min": 0.0167, // (1 / 60)      
      "5 mins": 0.0833,// (5 / 60)      
      "10 mins": 0.1667, // (10 / 60)      
      "30 mins": 0.5, // (30 / 60)      
      "1 hour": 1,    
      "3 hours": 3,
      "6 hours": 6,
      "12 hours": 12,
      "24 hours": 24
    },  
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
  requestGraphData({ url, isGraphBeingUpdated, callback, namespace }) {
    controller.startAnimation(namespace); // shows something while data travels
    d3.json(url, (data) => {
        namespace.data = data;
        callback(isGraphBeingUpdated);
        controller.finishAnimation(namespace);
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
    
    const signsObj = controller.getModelData({ namespace: 'general', prop: 'currencySigns' });
    this.valueHolderUSD.innerHTML = signsObj['USD'] + this.formatNumber(rateUSD);
    this.valueHolderEUR.innerHTML = signsObj['EUR'] + this.formatNumber(rateEUR);
  },
  formatNumber(number) {
    return (+number.replace(',', '')).toFixed(2);
  }
};

const historyGraphView = {
  init() {
    // set default filters( they are changed by buttons/dropdown/input)
    const today = new Date();
    //const startDate = new Date();  
    controller.setModelData({
      namespace: 'history',
      params: {
        end: this.formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        start: this.formProperDateFormat(today.getFullYear(), today.getMonth(), today.getDate()),
        currency: 'USD',
        waitMessageObj: new waitMessage('history'),
      }
    });
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
        this.attachFiltersEvents();
      }
  },
  buildLine({ dataset, width, height }) {
    this.makeScales({ dataset, width, height });
    this.lineFunction = d3.line()
                            .x(d => this.xScale(d.time.getTime()))
                            .y(d => this.yScale(d.currencyValue))
                            //.curve(d3.curveBasis);              

    this.graphSVG = d3.select('.graph--history').append('svg');
    // constructed basic graph
    this.graphSVG
      .attrs({
        width,
        height,
        id: 'historical-data',
      })
      .append('path')
        .attrs({
          'd': this.lineFunction(dataset),
          'stroke': '#C2390D',
          'stroke-width': 2,
          'fill': 'none',
          'id': 'graph-line--main',
        });
    // add axises
    // current timeline defaults to 1-month
    controller.setModelData({ namespace: 'history', params: {'currentTimeline': 'less-than-3-month'} });
    
    const { yTicks, xTicks, xTickFormat } = this.determineTicks(dataset);    
    const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks).tickFormat(d3.format('.2f'));
    const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTicks).tickFormat(d3.timeFormat(xTickFormat));

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
    this.drawCurrencySign();
    this.createHashTable(dataset);
    this.addMovableParts(dataset, height);
  },
  updateLine({ dataset, width, height }) {
    // dataset has changed, need to update #historical-data graph
    this.graphSVG = d3.select('.graph--history').select('#historical-data');
    // data is in chronological order
    this.makeScales({ dataset, width, height });
      // update basic graph
    this.graphSVG
      .select('path')
        .transition()
        .duration(1000)
        .attrTween('d',  (() => {
          const self = this;
          return function() {
            const previous = d3.select(this).attr('d');
            const current = self.lineFunction(dataset);
            return interpolatePath(previous, current); // adds/removes points from prev to match current => for better graph transformations
          }
        })());
    // update axises
    const { yTicks, xTicks, xTickFormat } = this.determineTicks(dataset);
    const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks).tickFormat(d3.format('.2f'));
    const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTicks).tickFormat(d3.timeFormat(xTickFormat));

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
  makeScales({ dataset, width, height }) {
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
      const signsObj = controller.getModelData({ namespace: 'general', prop: 'currencySigns' });
      const currencyCode = controller.getModelData({ namespace: 'history', prop: 'currency' });
      text
        .transition()
        .duration(500)
        .attrs({
          y: '-10'
        })
        .node().innerHTML = signsObj[currencyCode];        
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
    };
    
    const { ticksInfo , currentTimeline } = controller.getModelData({
      namespace: 'history',
      props: ['ticksInfo', 'currentTimeline']
    });        

    const { xTicks, yTicks, xTickFormat } = ticksInfo[currentTimeline];

    let prevLarger = d3.max(dataset, d=> d.currencyValue);
    let prevSmaller = d3.min(dataset, d => d.currencyValue);
    const yTicksArray = formTicksArray({
      finalLevel: yTicks || 0,
      level: 1,
      prevSm: prevSmaller,
      prevLg: prevLarger
    });
    
    prevSmaller = dataset[0].time.getTime();
    prevLarger = dataset[dataset.length - 1].time.getTime();

    const xTicksArray = formTicksArray({
      finalLevel: xTicks || 0,
      level: 1,
      prevSm: prevSmaller,
      prevLg: prevLarger
    });

    return {
      yTicks: yTicksArray,
      xTicks: xTicksArray,
      xTickFormat
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
    controller.setModelData({
      namespace: 'history',
      params: { hashTable }
    });    
  },
  addMovableParts(dataset, height) {
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
        const marginLeft = d3.select('.graph--history').node().offsetLeft;
        const graphSVGStyles = getComputedStyle(this.graphSVG.node());
        let paddingLeft = graphSVGStyles.paddingLeft;
        paddingLeft = +(cutLastNChars(paddingLeft, 2)); // getting rid of 'px' part

        const xPos = d3.event.clientX - marginLeft - paddingLeft;          
        const value = controller.getModelData({ namespace: 'history', prop: 'hashTable' })[xPos];
        //controller.getHashValue(xPos);
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
      
      const signsObj = controller.getModelData({ namespace: 'general', prop: 'currencySigns' });
      const currencyCode = controller.getModelData({ namespace: 'history', prop: 'currency' });

      this.tooltip
        .transition()
        .duration(100)
        .style('opacity', 0.75)

      const graph = d3.select('.graph--history').node();
      
      this.tooltip.html(
        `<h4>${this.formProperDateFormat(time.getFullYear(), time.getMonth() + 1, time.getDate())}</h4>
          <strong>Price: ${signsObj[currencyCode] + currencyValue.toFixed(2)}</strong>`
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
  formProperDateFormat(year, month, day) { // example: turns (2017, 5, 14) into 2017-05-15    
    const dateStr = `${year}-${month < 10 ? ('0' + month) : month}-${day < 10 ? ('0' + day) : day}`;        
    return dateStr;
  },
  attachFiltersEvents() {
    this.prevBtn = d3.select('.button[data-timeline="1-month"]').node();
    d3.selectAll('.filters--history .button')
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
    let timeline; // each of 6 buttons fall under 3 periods      
    const today = new Date(); // endDate
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
    controller.setModelData({ 
      namespace: 'history', 
      params: {
        currentTimeline: timeline,
        end:             this.formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        start:           this.formProperDateFormat(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate())
      }
    });
    // update timeline filter   
    // apply all filters and get proper url
    const url = controller.createHistoryURL();
    controller.updateGraphData({
      url,
      namespace: model.history, 
      callback: controller.renderHistoryGraph 
    });
  },
  currencyDropdownChange() {
      controller.setModelData({ namespace: 'history', params: {currency: d3.event.target.value} });
      // apply all filters and get proper url
      const url = controller.createHistoryURL();
      controller.updateGraphData({ 
        url,
        namespace: model.history, 
        callback: controller.renderHistoryGraph 
      });
  },
  initCalendar() {
    const inputs = document.querySelectorAll('.flatpickr-target');
    let endDate = new Date();
    let startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate);
    
    const placeHolderVal = controller.getModelData({ namespace: 'history', prop: 'start' });
    inputs[0].placeholder = placeHolderVal;
    inputs[1].placeholder = placeHolderVal;

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
          controller.setModelData({ namespace: 'history', params: { start: dateStr } });
        } else { // endInpt === instance
          endDate = _selectedDates[0];
          controller.setModelData({ namespace: 'history', params: { end: dateStr } });
        }
               
        const { start, end } = controller.getModelData({ namespace: 'history', props: ['start', 'end'] });
        
        if(end > start) {
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
          
          controller.setModelData({ namespace: 'history', params: {'currentTimeline': timeline} });

          const url = controller.createHistoryURL();
          controller.updateGraphData({
            url,
            namespace: model.history,
            callback: controller.renderHistoryGraph
          });
        }
      }
    });
    const startInput = inputs[0]._flatpickr;
    const endInput = inputs[1]._flatpickr;      
  }
};

// WAIT MESSAGE CLASS
const waitMessage = function(classModifier) {
  this.message = document.querySelector(`.graph--${classModifier} .wait-message`);
};
waitMessage.prototype = {
  show: function() {
    this.message.style.opacity = 0.75;
  },
  hide: function() {
    this.message.style.opacity = 0;
  }
};

const currencyPairGraphsView = {
  init() {
    controller.setModelData({
      namespace: 'currencyPair', 
      params: {
        pairName: 'BTCLTC',
        hours: 2,
        dataPoints: 120, // === 1 min
        waitMessageObj: new waitMessage('currency-pair'),
        currentDivisor: 0.0167,
      }
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
      this.attachFiltersEvents();
    }
  },
  makeScales({ dataset, width, height }) {   
    const firstDate = new Date(dataset[0].created_on).getTime();
    const lastDate = new Date(dataset[dataset.length - 1].created_on).getTime();

    this.xScale = d3.scaleLinear()
      .domain([
        firstDate,
        lastDate
      ])
      .range([0, width]);

    this.yScale = d3.scaleLinear()
      .domain([
        d3.min(dataset, d => this.minFuncForY(d)),
        d3.max(dataset, d => +d.ticker.ask)
      ])
      .range([height, 0]);
  },
  updateLines({ dataset, width, height }) {
     // dataset has changed, need to update #historical-data graph
    this.graphSVG = d3.select('.graph--currency-pair').select('#currency-pair');
    // data is in chronological order
    this.makeScales({ dataset, width, height });
       // update basic graph
    const appendLineOfType = (typeObj) => {
      const opacityVal = typeObj.hidden ? 0 : 1;      
      this.graphSVG
        .select('path#graph-line--' + typeObj.type)
          .transition()
          .duration(1000)
          .attrTween('d',  function() {
            const previous = d3.select(this).attr('d');
            const current = typeObj.lineFunction(dataset);
            return interpolatePath(previous, current); // adds/removes points from prev to match current => for better graph transformations
          })
          .style('opacity', opacityVal);
    }

    appendLineOfType(this.ask); // ask-graph
    appendLineOfType(this.bid); // bid-graph
    appendLineOfType(this.spread); // spread-graph

    // update axises
    const yAxisGen = d3.axisLeft(this.yScale);
    const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat('%H:%M'));

    const yAxis = this.graphSVG
                    .select('g.y-axis')
                    .transition()
                    .duration(1000)
                    .call(yAxisGen);
                    
    const xAxis = this.graphSVG
                    .select('g.x-axis')
                    .transition()
                    .duration(1000)
                    .call(xAxisGen);
  },
  buildLines({ dataset, width, height }) {
    this.graphSVG = d3.select('.graph--currency-pair').append('svg');    
    this.makeScales({ dataset, width, height });

    this.graphSVG
    .attrs({
      width,
      height,
      id: 'currency-pair',
    }) 

    // EACH GRAPH'S UNIQUE DATA
    this.ask = {
      type: 'ask',
      color: '#3498DB',
      hidden: false,
      lineFunction:  d3.line()
                       .x(d => this.xScale(new Date(d.created_on).getTime()))
                       .y(d => this.yScale(+d.ticker.ask)),
    };

    this.bid = {
      type: 'bid',
      color: '#E74C3C',
      hidden: false,
      lineFunction: d3.line()
                      .x(d => this.xScale(new Date(d.created_on).getTime()))
                      .y(d => this.yScale(+d.ticker.bid))
    };

    this.spread = {
      type: 'spread',
      color: '#2ECC71',
      hidden: true,
      lineFunction: d3.line()
                      .x(d => this.xScale(new Date(d.created_on).getTime()))
                      .y(d => this.yScale((+d.ticker.ask) - (+d.ticker.bid)))
    };
 
    const appendLineOfType = (typeObj) => {
      const opacityVal = typeObj.hidden ? 0 : 1;
      this.graphSVG
        .append('path')
          .attrs({
            'd': typeObj.lineFunction(dataset),
            'stroke': typeObj.color,
            'stroke-width': 2,
            'fill': 'none',
            'id': 'graph-line--' + typeObj.type,
          })
          .style('opacity', opacityVal);
    };
  
    // construct 3 basic graphs    
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
  attachFiltersEvents() {
    d3.selectAll('.displayed-graphs input')
      .on('change', () => this.toggleGraph());

    d3.selectAll('#cryptocoin-codes')
      .on('change', () => this.changePairName());

    d3.selectAll('.hours-input')
      .on('submit', () => this.changeHours());

    d3.selectAll('#data-points-frequency')
      .on('change', () => this.changeDataPointsFreq());

    d3.select('#spread')
      .on('change', () => this.adjustForSpreadGraph());
  },
  toggleGraph() {
    const id =  d3.event.target.id;
    const opacityVal = d3.event.target.checked === true ? 1 : 0;
    d3.select('#graph-line--' + id)
      .transition()
      .duration(600)
      .style('opacity', opacityVal);
  },
  minFuncForY(d) {
    return +d.ticker.bid;
  },
  adjustForSpreadGraph() {
    const checked = !!d3.event ? d3.event.target.checked : false;
    if(!!checked) {
      this.minFuncForY = d => (+d.ticker.ask) - (+d.ticker.bid);
    }
    else {
      this.minFuncForY = d => (+d.ticker.bid);
    }
    this.spread.hidden = !checked;
       
    const { data , width, height } = controller.getModelData({ namespace: 'currencyPair', props: ['data', 'width', 'height'] });
    
    this.updateLines({ dataset: data, width, height });
  },
  changePairName() {
    const pairName = d3.event.target.value;
    this.applyFilterChange({ pairName });
  },
  changeHours() {
    d3.event.preventDefault();
    const input = d3.event.target.querySelector('#hours');
    const hours = +input.value;
    input.placeholder = hours;
    input.value = '';
    input.blur();

    const divider = controller.getModelData({ namespace: 'currencyPair', prop: 'currentDivisor' });
    const dataPoints = Math.floor(hours / divider);
    this.applyFilterChange({ hours, dataPoints });    
  },
  changeDataPointsFreq() {
    const hours = controller.getModelData({ namespace: 'currencyPair', prop: 'hours' });
    
    const frequency = d3.event.target.value || '';    
    const divider = controller.getModelData({
      namespace: 'currencyPair',
      prop: 'dataPointDivisors'
    })[frequency];

    controller.setModelData({ 
      namespace: 'currencyPair', 
      params: {'currentDivisor': divider}
    });
    
    let dataPoints = Math.floor(hours / divider);
    if(dataPoints !== 0) {
      if(dataPoints === 1) {
        dataPoints++;
      }
      this.applyFilterChange({ dataPoints });
    }
  },
  applyFilterChange(propertiesToChange) {
    controller.setModelData({ namespace: 'currencyPair', params: propertiesToChange });    
    const url =  controller.createCurrencyPairURL();
    controller.updateGraphData({
      url,
      namespace: model.currencyPair,
      callback: controller.renderCurrencyPairGraph
    });
  }
};

const controller = {
    init() {
      // request data for history graph
      historyGraphView.init(),
      model.requestGraphData({
        url: this.createHistoryURL(),
        isGraphBeingUpdated: false,
        namespace: model.history,
        callback: this.renderHistoryGraph,
      });

      // request data for currency pair graph
      currencyPairGraphsView.init();      
      model.requestGraphData({
        url: this.createCurrencyPairURL(),
        isGraphBeingUpdated: false,
        namespace: model.currencyPair,
        callback: this.renderCurrencyPairGraph,
      });

      model.startFetchingData();
      currentPriceView.init();
    },
    // general methods
    updateGraphData({ url, namespace, callback }) {
      // this funtion will be called inside a view
      model.requestGraphData({
        url,
        isGraphBeingUpdated: true,
        namespace,
        callback
      });
    },
    startAnimation(namespace) {
      namespace.waitMessageObj.show();
    },
    finishAnimation(namespace) {
      namespace.waitMessageObj.hide();
    },
    setModelData({ namespace, params }) {
      const props = Object.keys(params);
      props.forEach(prop => {
        model[namespace][prop] = params[prop];
      });
    },
    getModelData({ namespace, prop, props }) {      
      if(!!props) {
        const output = {};
        props.forEach(prop => {
          output[prop] = model[namespace][prop];
        });        
        return output;
      }
      return model[namespace][prop];
    },
    // class specific methods
    createCurrencyPairURL() {
      const { pairName, dataPoints, hours } = model.currencyPair;
      return `https://api.nexchange.io/en/api/v1/price/${pairName}/history/?data_points=${dataPoints}&format=json&hours=${hours}`;
    },
    createHistoryURL() {
      const { url, start, end, currency } = model.history;
      return url + `?start=${start}&end=${end}&currency=${currency}`;
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
};

controller.init();