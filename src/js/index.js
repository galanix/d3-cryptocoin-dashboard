import WaitMessage from './components/WaitMessage';
import Graph from './components/Graph';
import '../scss/index.scss';

import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';
import flatpickr from 'flatpickr';
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
        xTickFormat: '%b\'%y',
        yTicks: 3
      },
      'less-than-3-month': {
        xTicks: 3,
        xTickFormat: '%e\'%b',
        yTicks: 3
      }
    },
    //graphs,
    // end,
    // start,
    // currency,
    // waitMessageObj,
  },
  currencyPair: {
    data: {},
    width: 500,
    height: 250,
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
    // graphs
    // pairName,
    // hours,
    // dataPoints,
    // waitMessageObj,
    // currentDivisor,
  },
  cryptoBoard: {
    url: 'https://api.coinmarketcap.com/v1/ticker/',
    data: {},
    width: 500,
    height: 250,
    additionalFilters: {
      marketCap: {
        '0': 'All',
        '1': 1000000000, // +
        '2': [100000000, 1000000000],
        '3': [10000000, 100000000],
        '4': [1000000, 10000000],
        '5': [100000, 1000000],
        '6': [0, 100000]
      },
      price: {
        '0': 'All',
        '1': 100, // +
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
      keys: {
        marketCap: '0',
        price: '0',
        volume_24h: '0'
      }
    }
    // chart {}
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
  requestModuleData({ url, isModuleBeingUpdated, callback, namespace }) {    
    controller.startAnimation(namespace); // shows something while data travels
    d3.json(url, (data) => {
      namespace.data = data;
      controller.finishAnimation(namespace);  
      callback(isModuleBeingUpdated);    
    });
  },
};

const currentPriceView = {
  init() {
      this.valueHolderUSD = document.querySelector('.current-price__USD .value');
      this.valueHolderEUR = document.querySelector('.current-price__EUR .value');      
  },
  renderData({ rateUSD, rateEUR, signsObj }) {
    const transition = 'all .5s ease-in';    
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
      transition,
      color: highlightColor
    });
    
    setTimeout(() => {
      setStyle({      
        color: blackColor
      })
    }, 2500);
        
    this.valueHolderUSD.innerHTML = signsObj['USD'] + this.formatNumber(rateUSD);
    this.valueHolderEUR.innerHTML = signsObj['EUR'] + this.formatNumber(rateEUR);
  },
  formatNumber(number) {
    return (+number.replace(',', '')).toFixed(2);
  }
};

const historyView = {
  init() {
    // set default filters( they are changed by buttons/dropdown/input)
    const today = new Date();
    controller.setModelData({
      namespace: 'history',
      params: {
        end: this.formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        start: this.formProperDateFormat(today.getFullYear(), today.getMonth(), today.getDate()),
        currency: 'USD',
        waitMessageObj: new WaitMessage('history'),
      }
    });    
  },
  renderGraph({ width, height, data, isModuleBeingUpdated }) {
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

      if(isModuleBeingUpdated) { // substitute dataset and update current graph
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
        controller.initCalendar();
      }
  },
  buildLine({ dataset, width, height }) {
    this.makeScales({ dataset, width, height });
    
    this.graphSVG = d3.select('.graph--history').append('svg');
    // constructed basic graph
    const graphObj = new Graph({
      type: 'bitcoin-rate',
      color: '#C2390D',
      hidden: false,
      lineFunction:  d3.line()
                        .x(d => this.xScale(d.time.getTime()))
                        .y(d => this.yScale(d.currencyValue)),
      container: this.graphSVG,
    });

    controller.setModelData({
      namespace: 'history',
      params: { 
        graphs: {
          [graphObj.type]: graphObj
        }
      },
    });
    
    this.graphSVG
      .attrs({
        width,
        height,
        id: 'historical-data',
      });

    graphObj.append(dataset);
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
    const graphInstances = controller.getModelData({ namespace: 'history', prop: 'graphs' });
    const keys = Object.keys(graphInstances);
    keys.forEach(key => {
      graphInstances[key].update(dataset);
    });

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
      .style('opacity', 0);             
  },
  formProperDateFormat(year, month, day) { // example: turns (2017, 5, 14) into 2017-05-15    
    const dateStr = `${year}-${month < 10 ? ('0' + month) : month}-${day < 10 ? ('0' + day) : day}`;        
    return dateStr;
  },
  attachFiltersEvents() {
    this.prevBtn = d3.select('.button[data-timeline="1-month"]').node();

    d3.selectAll('.filters--history .button')
      .on('click', () => { 
        this.changeSelectedButton();
        controller.timelineBtnClick();
      });      

    d3.select('#currencies')
      .on('change', () => controller.currencyDropdownChange());
  },
  changeSelectedButton() {
    d3.event.preventDefault();      
    const btn = d3.event.target;
    if(btn !== this.prevBtn) {
      this.prevBtn.classList.remove('selected');
      btn.classList.add('selected');
      this.prevBtn = btn;   
    }
  }
};

const currencyPairView = {
  init() {
    controller.setModelData({
      namespace: 'currencyPair', 
      params: {
        pairName: 'BTCLTC',
        hours: 2,
        dataPoints: 120, // === 1 min
        waitMessageObj: new WaitMessage('currency-pair'),
        currentDivisor: 0.0167,
      }
    });
  },
  renderGraph({ width, height, dataset, isModuleBeingUpdated }) {
    //const dataset = data;

    // NOT DRY
    if(isModuleBeingUpdated) { // substitute dataset and update current graphs(max3)
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
  buildLines({ dataset, width, height }) {
    this.graphSVG = d3.select('.graph--currency-pair').append('svg');
    this.makeScales({ dataset, width, height });

    this.graphSVG
      .attrs({
        width,
        height,
        id: 'currency-pair',
      });

    //INSTANTIATE GRAPH OBJECTS
    this.createGraphInstances(dataset);
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
  updateLines({ dataset, width, height }) {
    if(!dataset) {
      return;
    }

    this.graphSVG = d3.select('.graph--currency-pair').select('#currency-pair');
    // dataset has changed, need to update #historical-data graph
    // data is in chronological order
    this.makeScales({ dataset, width, height });
        // update basic graph
    const graphInstances = controller.getModelData({ namespace: 'currencyPair', prop: 'graphs' });
    const keys = Object.keys(graphInstances);
    keys.forEach(key => {
      graphInstances[key].update(dataset);
    });
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
  attachFiltersEvents() {
    d3.selectAll('.displayed-graphs input')
      .on('change', () => this.toggleGraph()); // pure view 

    d3.selectAll('#cryptocoin-codes')
      .on('change', () => controller.changePairName());

    d3.selectAll('.hours-input')
      .on('submit', () => controller.changeHours());

    d3.selectAll('#data-points-frequency')
      .on('change', () => controller.changeDataPointsFreq());

    d3.select('#spread')
      .on('change', () => controller.adjustForSpreadGraph());
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
      
    const graphInstances = controller.getModelData({ namespace: 'currencyPair', prop: 'graphs' });
    const spread = !!graphInstances ? graphInstances['spread'] : null;
        
    if(!spread || !!spread.hidden) {
      const askMin = d3.min(dataset, d => +d.ticker.ask);
      const bidMin = d3.min(dataset, d => +d.ticker.bid);

      this.minFuncForY = askMin < bidMin ? d => +d.ticker.ask : d => +d.ticker.bid;    
    } else {
      this.minFuncForY = d => Math.abs((+d.ticker.ask) - (+d.ticker.bid));
    }

    const askMax = d3.max(dataset, d => +d.ticker.ask);    
    const bidMax = d3.max(dataset, d => +d.ticker.bid);    
    this.maxFuncForY = askMax > bidMax ? d => +d.ticker.ask : d => +d.ticker.bid;

    this.yScale = d3.scaleLinear()
      .domain([
        d3.min(dataset, d => this.minFuncForY(d)),
        d3.max(dataset, d => this.maxFuncForY(d))
      ])
      .range([height, 0]);
  },
  minFuncForY(d) {},
  createGraphInstances(dataset) {
  
    const ask = new Graph({
      type: 'ask',
      color: '#3498DB',
      hidden: false,
      lineFunction:  d3.line()
                       .x(d => this.xScale(new Date(d.created_on).getTime()))
                       .y(d => this.yScale(+d.ticker.ask)),
      container: this.graphSVG
    });
    ask.append(dataset);

    const bid = new Graph({
      type: 'bid',
      color: '#E74C3C',
      hidden: false,
      lineFunction: d3.line()
                      .x(d => this.xScale(new Date(d.created_on).getTime()))
                      .y(d => this.yScale(+d.ticker.bid)),
      container: this.graphSVG
    });
    bid.append(dataset,);

    const spread = new Graph({
      type: 'spread',
      color: '#2ECC71',
      hidden: true,
      lineFunction: d3.line()
                      .x(d => this.xScale(new Date(d.created_on).getTime()))
                      .y(d => this.yScale((+d.ticker.ask) - (+d.ticker.bid))),
      container: this.graphSVG
    });
    spread.append(dataset);
    
    controller.setModelData({
      namespace: 'currencyPair',
      params: {
        graphs: {
          [ask.type]: ask,
          [bid.type]: bid,
          [spread.type]: spread
        }
      }
    });
  },
  toggleGraph() {
    const id =  d3.event.target.id;
    const opacityVal = d3.event.target.checked === true ? 1 : 0;
    d3.select('#graph-line--' + id)
      .transition()
      .duration(600)
      .style('opacity', opacityVal);
  }
};

const cryptoBoardView = {
  init() {
    this.subMenu = document.getElementsByClassName('modal-window')[0];
    this.modalBtn = document.getElementsByClassName('modal-button')[0];
    this.cancelBtn = document.getElementsByClassName('cancel-button')[0];
    this.boardBody = document.getElementsByClassName('board-body')[0];

    const waitMessageObj = new WaitMessage('crypto-chart');
    waitMessageObj.hide();

    controller.setModelData({
      namespace: 'cryptoBoard',
      params: {
        currency: 'USD',
        limit: 100,        
        chart: {
          hashTable: {},
          chartData: {},
          currency: 'USD',
          type: 'bar',
          //prevType: null,
          comparisionField: 'price_usd',
          waitMessageObj
        }
      }
    });

    this.attachFiltersEvents();
  },
  renderTable({ dataset, currency }) {
    this.boardBody.innerHTML = '';
    dataset.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'board-row';
      tr.innerHTML = `
        <td class="cell">
          <label>
            <input type="checkbox" data-index=${index}>
          </label>
        </td>
        <td class="cell">${index + 1}</td>
        <td class="cell">${item.name}</td>
        <td class="cell">${item['market_cap_' + currency.toLowerCase()]}</td>
        <td class="cell">${(+item['price_' + currency.toLowerCase()]).toFixed(5)}</td>
        <td class="cell">${item.available_supply}</td>
        <td class="cell">${item['24h_volume_' + currency.toLowerCase()]}</td>
        <td class="cell">${item.percent_change_1h}</td>
        <td class="cell">${item.percent_change_24h}</td>
        <td class="cell">${item.percent_change_7d}</td>
      `;
      this.boardBody.appendChild(tr);
    });
    d3.selectAll('.cell input')
      .on('change', () => controller.toggleItemForGraphDraw());

    //this.checkPreviousItems();
  },
  attachFiltersEvents() {
    d3.selectAll('.filters--board .table-length button')
      .on('click', () => controller.changeTableLength());

    d3.select('.filters--board .board-currencies')
      .on('change', () => controller.changeTableCurrency());

    d3.selectAll('.filters--board .additional-filters select')
      .on('change', () => controller.filterTableContent());

    d3.select('.filters--board .clear-filters-btn')
      .on('click', () => controller.clearTableFilters());

    this.modalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.subMenu.style.maxHeight = 2000 + 'px';
    });

    this.cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.subMenu.style.maxHeight = 0 + 'px';
    });

    d3.select('#graph-currencies')
      .on('change', () => controller.changeGraphCurrency());


    const handleClickWithBtnSelection = ({ selector, callback, classCSS }) => {
      let prevBtn = d3.select(selector).node();
      prevBtn.classList.add(classCSS); 

      d3.selectAll(selector)
        .on('click', () => {
          const currBtn = d3.event.target;
          if(currBtn !== prevBtn) {
            currBtn.classList.add(classCSS);
            prevBtn.classList.remove(classCSS);        
            prevBtn = currBtn;
          }
  
          if(!!callback) callback();
        });
    }

    handleClickWithBtnSelection({
      selector: '.filters--board .category button',
      classCSS: 'selected',
      callback: controller.changeComparisionField
    });


    handleClickWithBtnSelection({
      selector: '.filters--board .type button',
      classCSS: 'selected',
      callback: controller.changeChartType
    });    

    d3.selectAll('.filters--board .build-button')
      .on('click', () => controller.buildChart());
  },
  hideModalBtn() {
    this.modalBtn.style.opacity = 0;
    this.subMenu.style.maxHeight = 0 + 'px';
  },
  showModalBtn() {
    this.modalBtn.style.opacity = 1;
  },
  midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  },
  renderChart({ hashTable, type, comparisionField,/* chartIsBeingUpdated */ }) {
    if(!this.chartSVG) this.chartSVG = d3.select('.graph--crypto-chart').append('svg').attr('id', 'crypto-chart');    
    if(!this.legend) this.legend = d3.select('.graph--crypto-chart').append('div').attr('class', 'legend');

    const stylesSVG = getComputedStyle(this.chartSVG.node());
    const width = parseInt(stylesSVG.width);
    const height = parseInt(stylesSVG.height);

    const keys = Object.keys(hashTable);
    const dataset = keys.map(key => hashTable[key]);
    const colorValues = keys.map(key => hashTable[key].color);

    this.chartSVG.selectAll('*').remove();
    this.legend.selectAll('*').remove();
    this.color = d3.scaleOrdinal(colorValues);

    switch(type) {
      case 'pie':
        this.renderPieChart({ dataset, width, height, comparisionField });
        break;
      case 'bar':
        this.renderBarChart({ dataset, width, height, comparisionField });
        break;
    }

    //if(!chartIsBeingUpdated) this.chartSVG.selectAll('*').remove();
    /*switch(`${type}, update: ${chartIsBeingUpdated.toString()}`) {
      case 'pie, update: true':
        this.updatePieChart({ hashTable, width, height, comparisionField });        
        break;
      case 'pie, update: false':
        this.renderPieChart({ hashTable, width, height, comparisionField });
        break;
      case 'bar, update: true':
        this.updateBarChart({ hashTable, width, height, comparisionField });        
        break;
      case 'bar, update: false':
        this.renderBarChart({ hashTable, width, height, comparisionField });
        break;
      default:
        console.warn('something went wrong with chart type');
    }*/
  },
  buildLegendSection({ dataset, comparisionField, handleHoverEvent }) {
    let index = 0;
    const items = this.legend.selectAll('.legend__item')
      .data(dataset)
      .enter()
      .append('div')
      .attrs({
        'data-index': () => index++,
        'class': 'legend__item',
      })
      .on('mouseover', d => handleHoverEvent(1, this.color(d[comparisionField]), d, comparisionField ))
      .on('mouseout', d => handleHoverEvent(0, '#333', d, comparisionField));

    items
      .append('span')
      .attr('class', 'square')
      .style('background-color', d => this.color(d[comparisionField]));

    items
      .append('span')
      .text(d => d.name);
  },
  // PIE
  renderPieChart({ dataset, width, height, comparisionField }) {
    this.radius = Math.min(height,width) / 2;
    this.labelr = this.radius + 20; // label radius    

    this.g = this.chartSVG.append('g')
      .attrs({
        'transform': `translate(${width / 2}, ${height / 2})`,
        'class': 'pie'
      });

    this.pie = d3.pie()
      .sort(null)
      .value(d => {
        let value = +d[comparisionField];
        if(value < 0) {
          value = 1 / Math.abs(value);
        }
        return value;
      });

    this.path = d3.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);

    this.label = d3.arc()
      .outerRadius(this.labelr)
      .innerRadius(this.labelr);

    const arc = this.g.selectAll('.arc')
      .data(this.pie(dataset))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .each(function(d) { this._current = d; }); // store the initial angles

    this.appendPieSlices(arc, comparisionField);
    
    // BUILDING THE LEGEND
    this.buildLegendSection({
      dataset,
      comparisionField,
      handleHoverEvent: this.handleHoverEventPie.bind(this)
    });
  },
  togglePieLabel(parent, opacityVal) {
    parent.getElementsByTagName('text')[0].style.opacity = opacityVal;
    parent.getElementsByTagName('polyline')[0].style.opacity = opacityVal;
  },
  handleHoverEventPie(opacityVal, color) {
    let item = d3.event.target;
    if(item.tagName !== 'DIV') item = item.parentElement;

    item.getElementsByTagName('span')[1].style.color = color;

    const labels = Array.prototype.slice.call(document.getElementsByClassName('arc'));
    const label = labels[item.getAttribute('data-index')];
    this.togglePieLabel(label, opacityVal);

    const callback = opacityVal === 1 ?
      labelItem => {
        if(labelItem !== label) {
          labelItem.style.opacity = 0.25;
        }
      } :
      labelItem => {
        labelItem.style.opacity = 1;
      };

    labels.forEach(callback);
  },
  appendPieSlices(selection, comparisionField) {
    selection
      .append('path')
      .attrs({
        d: this.path,
        fill: d => this.color(d.data[comparisionField]),
        stroke: '#fff'
      })
      .on('mouseover', () => this.togglePieLabel(d3.event.target.parentElement, 1))
      .on('mouseout', () => this.togglePieLabel(d3.event.target.parentElement, 0));
    
    const text = selection
      .append('text')
      .attrs({
        transform: d => {
          const pos = this.label.centroid(d);
          const direction = this.midAngle(d) < Math.PI ? 1 : -1;
          // determine polyline width and padd it
          pos[0] = this.labelr * direction;
          // determine the amount of space needed for word and padd it
          if(direction <  1) {
            if(!this.wordLengthTest) {
              const div = d3.select('body')
                .append('div')
                .attr('id', 'word-length-tester');
              div.append('p');
              div.append('p');
              this.wordLengthTest = d3.selectAll('#word-length-tester p').nodes();
            }
            
            this.wordLengthTest[0].textContent = d.data.name;
            this.wordLengthTest[1].textContent = d.data[comparisionField];
            const wordLength0 = parseInt(getComputedStyle(this.wordLengthTest[0]).width) + 1;
            const wordLength1 = parseInt(getComputedStyle(this.wordLengthTest[1]).width) + 1;
            pos[0] -= wordLength0 < wordLength1 ? wordLength1 : wordLength0;
          }
          
          return `translate(${pos})`;
        },
        'text-anchor': d => this.midAngle(d) / 2 > Math.PI ? 'end' : 'start',
        stroke: d => this.color(d.data[comparisionField]),
      })
      .style('opacity', 0)
      
    setTimeout(() => text.style('transition', 'opacity .5s ease-in'), 500); // kostyl

    text
      .append('tspan')
        .attrs({
          x: '0',
          dy: '-0.35em',
        })
        .text(d => d.data.name)      
    text
      .append('tspan')
        .attrs({
          x: '0',
          dy: '1.1em',
        })
        .style('font-size', '.75em')
        .text(d => d.data[comparisionField])
        

    selection
      .append('polyline')
      .attrs({
        stroke: d => this.color(d.data[comparisionField]),
        'stroke-width': 2,
        fill: 'none',
        points: d => {
          const pos = this.label.centroid(d);
          const direction = this.midAngle(d) < Math.PI ? 1 : -1;
          pos[0] = this.labelr * direction;
          return [ this.path.centroid(d), this.label.centroid(d), pos ];
        }
      })
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('transition', 'opacity .5s ease-in');
  },
  // BAR
  renderBarChart({ dataset, width, height, comparisionField }) {
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    width -= (margin.left + margin.right);
    height -= (margin.top + margin.bottom);

    const xScale = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1)
      .domain(dataset.map((d, i) => ++i));
        
    const yScale = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, d3.max(dataset, d => +d[comparisionField])]);

    const g = this.chartSVG.append('g')
      .attrs({
        'transform': `translate(${margin.left}, ${margin.top})`,
        'class': 'bar'
      });

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale));

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(yScale).ticks(10))
      .append('text')
        .attrs({
          'transform': 'rotate(-90)',
          'y': 6,
          'dy': '0.71em',
          'text-anchor': 'end'
        })
        .text(d => comparisionField);

    const bars = g.selectAll('.col')
      .data(dataset)
      .enter()
      .append('g')
      .attr('class', 'col');

    bars
      .append('rect')
        .attrs({
          'fill':  d => this.color(+d[comparisionField]),
          'x': (_d,i) => xScale(++i),
          'y': d => yScale(+d[comparisionField]),
          'width': xScale.bandwidth(),
          'height': d => height - yScale(+d[comparisionField]),
          'data-index': (_d,i) => i,
        })
        .on('mouseover', d => this.toggleBarLabel(d3.event.target.getAttribute('data-index'), d, comparisionField))
        .on('mouseout', d => this.toggleBarLabel(d3.event.target.getAttribute('data-index'), d, comparisionField, true));
    
    // const text = bars
    //   .append('text')
    //     .attrs({
    //       'dx': (d,i) => xScale(++i),
    //       'dy': d => yScale(+d[comparisionField]),
    //       'stroke': d => this.color(+d[comparisionField]),
    //       'stroke-width': 1
    //     })
    //     .style('opacity', 0)
    //     .style('transition', 'opacity .5s ease-in')        

    // text
    //   .append('tspan')
    //     .attrs({
    //       //x: '0',
    //       dy: '-1em',
    //     })
    //     .text(d => d.name);
    // text
    //   .append('tspan')
    //     .attrs({
    //       //x: '0',
    //       dy: '.5em',
    //     })
    //     .style('font-size', '.75em')
    //     .text(d => d[comparisionField]);    
    
    this.buildLegendSection({
      dataset,
      comparisionField,
      handleHoverEvent: this.handleHoverEventBar.bind(this)
    });
  },
  toggleBarLabel(index, d, comparisionField, mouseOut) {
    index = +index;
    const tickGroups = document.querySelectorAll(`.bar .axis--x .tick`);
    const line = tickGroups[index].getElementsByTagName('line')[0];
    const text = tickGroups[index].getElementsByTagName('text')[0];
    const callback = !mouseOut ?
      g => {        
        if(g !== tickGroups[index]) g.getElementsByTagName('text')[0].style.opacity = 0;
      } :
      g => g.getElementsByTagName('text')[0].style.opacity = 1;

    tickGroups.forEach(callback);
    
    if(!mouseOut) {
      const color = this.color(+d[comparisionField]);
      text.style.fontSize = '1.5em';
      text.style.fill = color;
      text.style.fontWeight = 'bold';
      text.innerHTML = `
        <tspan x="0">${d.name}</tspan>
        <tspan x="0" dy="1.2em">${d[comparisionField]}</tspan>
      `;
      line.style.stroke = color;
      line.style['stroke-width'] = 3;
    } else {      
      text.style.fontSize = '1em';
      text.style.fill = '#000';
      text.style.fontWeight = 'normal';
      text.innerHTML = ++index;

      line.style.stroke = '#000';
      line.style['stroke-width'] = 1;
    }  
  },
  handleHoverEventBar(opacityVal, color, d, comparisionField) {
    let item = d3.event.target;
    if(item.tagName !== 'DIV') item = item.parentElement;    

    item.getElementsByTagName('span')[1].style.color = color;

    const index = item.getAttribute('data-index');
    const rects = document.querySelectorAll('.col rect');
    const rect = rects[index];
    this.toggleBarLabel(index, d, comparisionField, (opacityVal === 1 ? false : true));

    const callback = opacityVal === 1 ?
      label => {
        if(label !== rect) {
          label.style.opacity = 0.25;
        }
      } :
      label => {
        label.style.opacity = 1;
      };
    
    rects.forEach(callback);
  },
  /*applyTransition(selection, comparisionField) {
    const self = this;
    selection
      .select('path')
      .transition().duration(750)
      .attrTween('d', function(a) {
        const i = d3.interpolate(this.parentElement._current, a);
        this.parentElement._current = i(0);
        return function(t) {
          return self.path(i(t));
        };
      });
  
    selection
      .select('text')
      .transition().duration(750)
      .attrTween("transform', function(d) {
        this.parentElement._current = this.parentElement._current || d;
        const interpolate = d3.interpolate(this.parentElement._current, d);
        this.parentElement._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          const pos = self.label.centroid(d2);
          pos[0] = self.radius * (self.midAngle(d2) < Math.PI ? 1 : -1);
          return 'translate('+ pos +')';
        };
      })
      .styleTween('text-anchor', function(d) {
        this._current = this.parentElement._current || d;
        const interpolate = d3.interpolate(this.parentElement._current, d);
        this.parentElement._current = interpolate(0);
        return function(t) {
          const d2 = interpolate(t);
          return self.midAngle(d2) < Math.PI ? 'start':'end';
        };
      });
  
    selection
      .select('polyline')
      .transition().duration(750)
      .attrTween('points', function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = self.label.centroid(d2);
          pos[0] = self.radius * 0.95 * (self.midAngle(d2) < Math.PI ? 1 : -1);
          return [self.path.centroid(d2), self.label.centroid(d2), pos];
        };
      });
  },*/
  /*updatePieChart({ hashTable, width, height, comparisionField }) {
    const keys = Object.keys(hashTable);
    const dataset = keys.map(key => hashTable[key]);
    const colorValues = keys.map(key => hashTable[key].color);
    this.color = d3.scaleOrdinal(colorValues);

    this.g.selectAll('.arc').remove();

    const arc = this.g.selectAll('.arc')
      .data(this.pie(dataset), d => d);

    const arcEnter = arc
      .enter()
      .append('g')
      .each(function(d) { this._current = d; }) // store the initial angles
      .attr('class', 'arc')
      .merge(arc);
      
   
    this.appendPieSlices(arcEnter, comparisionField);
    this.applyTransition(arcEnter, comparisionField);
    
    arc.exit().remove();    
  },*/
  /*updateBarChart({ hashTable, width, height, comparisionField }) {
  },*/
};

const controller = {
    init() {
      // request data for history graph
      historyView.init(),
      model.requestModuleData({
        url: this.createHistoryURL(),
        isModuleBeingUpdated: false,
        namespace: model.history,
        callback: this.renderHistoryGraph,
      });

      // request data for currency pair graph
      currencyPairView.init();   
      model.requestModuleData({
        url: this.createCurrencyPairURL(),
        isModuleBeingUpdated: false,
        namespace: model.currencyPair,
        callback: this.renderCurrencyPairGraph,
      });

      // request data for cryptoboard graph
      cryptoBoardView.init();      
      model.requestModuleData({
        url: this.createCryptoBoardURL(),
        // isModuleBeingUpdated: false,
        namespace: model.cryptoBoard,
        callback: this.renderCryptoBoardTable,
      });

      model.startFetchingData();
      currentPriceView.init();
    },
    // general methods
    updateGraphData({ namespace, callback }) {
      let url;
      if(namespace === model.currencyPair) {
        url = this.createCurrencyPairURL();
      } else {
        url = this.createHistoryURL();
      }

      model.requestModuleData({
        url,
        isModuleBeingUpdated: true,
        namespace,
        callback
      });
    },
    startAnimation(namespaceObj) {
      if(!!namespaceObj.waitMessageObj) {
        namespaceObj.waitMessageObj.show();
      }
    },
    finishAnimation(namespaceObj) {
      if(!!namespaceObj.waitMessageObj) {
        namespaceObj.waitMessageObj.hide();
      }
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
    createCryptoBoardURL(customCurrency) {
      let { url, currency, limit } = model.cryptoBoard;
      if(!!customCurrency) {
        currency = customCurrency;
      }
      return url + `?convert=${currency}&limit=${limit}`;
    },
    renderCurrentPrice() {
      currentPriceView.renderData({
          rateEUR: model.currentPrice.data.bpi.EUR.rate,
          rateUSD: model.currentPrice.data.bpi.USD.rate,
          signsObj: model.general.currencySigns      
      });
    },
    renderHistoryGraph(isModuleBeingUpdated) {
       const { width, height , data } = model.history;
       historyView.renderGraph({
           width,
           height,
           data: data.bpi,
           isModuleBeingUpdated
       });
    },
    renderCurrencyPairGraph(isModuleBeingUpdated) {
      const { width, height, data } = model.currencyPair;
      currencyPairView.renderGraph({
        width,
        height,
        dataset: data,
        isModuleBeingUpdated
      });
    },
    renderCryptoBoardTable(customParams) {
      const { data, currency } = !!customParams ? customParams : model.cryptoBoard;
      cryptoBoardView.renderTable({
        dataset: data,
        currency,
      });
    },
    // event handlers : currencyPairGraphView
    changePairName() {
      model.currencyPair.pairName = d3.event.target.value;

      this.updateGraphData({
        namespace: model.currencyPair,
        callback: this.renderCurrencyPairGraph
      });
    },
    changeHours() {
      d3.event.preventDefault();

      const input = d3.event.target.querySelector('#hours');
      const hours = +input.value;
      const divisor = model.currencyPair.currentDivisor;
      
      input.placeholder = hours;
      input.value = '';
      input.blur();      
      
      model.currencyPair.hours = hours;
      model.currencyPair.dataPoints = Math.floor(hours / divisor);

      controller.updateGraphData({
        namespace: model.currencyPair,
        callback: controller.renderCurrencyPairGraph
      });
    },
    changeDataPointsFreq() {
      const frequency = d3.event.target.value || '';
      // getting data from model
      const hours = model.currencyPair.hours;
      const divisor = model.currencyPair.dataPointDivisors[frequency];
      // changing model data
      model.currencyPair.currentDivisor = divisor;

      let dataPoints = Math.floor(hours / divisor);
      if(dataPoints !== 0) {
        if(dataPoints === 1) {
          dataPoints++;
        }
        
        model.currencyPair.dataPoints = dataPoints;
        controller.updateGraphData({
          namespace: model.currencyPair,
          callback: controller.renderCurrencyPairGraph
        });
      }
    },
    adjustForSpreadGraph() {
      const self = currencyPairView;
      const checked = !!d3.event ? d3.event.target.checked : false;
      model.currencyPair.graphs['spread'].hidden = !checked;
      const { data, width, height } = model.currencyPair;
      self.updateLines({ dataset: data, width, height });
    },
    // event handlers : historyView
    timelineBtnClick() {
      const btnValue = d3.event.target.getAttribute('data-timeline'); // button value         
      const today = new Date(); // endDate
      const startDate = new Date();
      let timeline; // each of 6 buttons fall under 3 periods   
  
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

      model.history.currentTimeline = timeline;
      model.history.end = historyView.formProperDateFormat(today.getFullYear(), today.getMonth() + 1, today.getDate());
      model.history.start = historyView.formProperDateFormat(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()); 
      
      // update timeline filter   
      // apply all filters and get proper url      
      controller.updateGraphData({       
        namespace: model.history, 
        callback: controller.renderHistoryGraph 
      });
    },
    currencyDropdownChange() {
        model.history.currency = d3.event.target.value;    
        controller.updateGraphData({     
          namespace: model.history, 
          callback: controller.renderHistoryGraph
        });
    },
    initCalendar() {
      const inputs = document.querySelectorAll('.flatpickr-target');
      let endDate = new Date();
      let startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate);
      
      const placeHolderVal = model.history.start;
      inputs[0].placeholder = placeHolderVal;
      inputs[1].placeholder = placeHolderVal;
  
      flatpickr(inputs, {
        allowInput: true,
        enable: [
          {
              from: '2010-07-17',
              to: historyView.formProperDateFormat(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate())
          }
        ],
        onChange(_selectedDates, dateStr, instance) {
          historyView.prevBtn.classList.remove('selected');

          if(startInput === instance) {
            startDate = _selectedDates[0];
            model.history.start = dateStr;            
          } else { // endInpt === instance
            endDate = _selectedDates[0];
            model.history.end = dateStr;            
          }
                 
          const { start, end } = model.history; 
          
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
            
            //controller.setModelData({ namespace: 'history', params: {'currentTimeline': timeline} });
            model.history.currentTimeline = timeline;
              
            controller.updateGraphData({
              namespace: model.history,
              callback: controller.renderHistoryGraph
            });
          }
        }
      });
      const startInput = inputs[0]._flatpickr;
      const endInput = inputs[1]._flatpickr;
    },
    // event handlers : cryptoBoardView
    changeTableLength() {
      d3.event.preventDefault();
      model.cryptoBoard.limit = +(d3.event.target.getAttribute('data-value'));
      model.requestModuleData({
        url: this.createCryptoBoardURL(),
        namespace: model.cryptoBoard,
        callback: this.renderCryptoBoardTable,
      });
    },
    changeTableCurrency() {
      model.cryptoBoard.currency = d3.event.target.value;

      model.requestModuleData({
        url: this.createCryptoBoardURL(),        
        namespace: model.cryptoBoard,
        callback: this.renderCryptoBoardTable,
      });
    },
    toggleItemForGraphDraw() {
      const key = +d3.event.target.getAttribute('data-index');
      const checked =  d3.event.target.checked;
      const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };
      if(!!checked) {
        // add        
        let generatedColor;
        let colorIsDuplicated = false;
        const keys = Object.keys(model.cryptoBoard.chart.hashTable);
        const hashTable = model.cryptoBoard.chart.hashTable;
        do {
          generatedColor = getRandomColor();
          keys.forEach(key => {
            if(hashTable[key].color === generatedColor) {
              colorIsDuplicated = true;
            }
          })
        }while(colorIsDuplicated);
        model.cryptoBoard.chart.hashTable[key] = model.cryptoBoard.data[key];
        model.cryptoBoard.chart.hashTable[key].color = generatedColor;
      } else {
        // remove
          delete model.cryptoBoard.chart.hashTable[key];
      }

      const selectionLength = Object.keys(model.cryptoBoard.chart.hashTable).length;
      if(selectionLength > 1) {
        // display that submenu
        cryptoBoardView.showModalBtn();
      } else {
        // hide that submenu
        cryptoBoardView.hideModalBtn();
      }
    },
    changeGraphCurrency() {
      if(model.cryptoBoard.chart.currency !== d3.event.target.value) {
        model.cryptoBoard.chart.currency = d3.event.target.value;
      }      
    },
    changeHashTableCurrency() {
      if(model.cryptoBoard.chart.currency === model.cryptoBoard.currency) {
        return; // no need for changing data
      }

      const keys = Object.keys(model.cryptoBoard.chart.hashTable);
      keys.forEach(key => {
        model.cryptoBoard.chart.hashTable[key] = model.cryptoBoard.chart.data[key];
      });
    },
    changeComparisionField() {
      d3.event.preventDefault();
      const btnVal = d3.event.target.textContent;
      const currency = model.cryptoBoard.chart.currency;
      let comparisionField;
      
      switch(btnVal) {
        case 'Price':
          comparisionField = 'price_' + currency.toLowerCase();
          break;
        case 'Volume(24h)':
          comparisionField = '24h_volume_' + currency.toLowerCase();
          break;
        case 'Market Cap':
          comparisionField = 'market_cap_' + currency.toLowerCase();
          break;
        case '%1h':
          comparisionField = 'percent_change_1h';
          break;
        case '%24h':
          comparisionField = 'percent_change_24h';
          break;
        case '%7d':
          comparisionField = 'percent_change_7d';
          break;
      }

      model.cryptoBoard.chart.comparisionField = comparisionField;
    },
    changeChartType() {
      d3.event.preventDefault();
      const prevValue = model.cryptoBoard.chart.type;      
      model.cryptoBoard.chart.type = d3.event.target.getAttribute('data-type');      
    },
    buildChart() {
      d3.event.preventDefault();      
      const { currency, hashTable, type, /*prevType,*/ comparisionField } = model.cryptoBoard.chart;
      //const chartIsBeingUpdated = prevType === type;
      
      //model.cryptoBoard.chart.prevType = type;

      model.requestModuleData({
        url: this.createCryptoBoardURL(currency),
        namespace: model.cryptoBoard.chart,
        callback: () => {
          this.changeHashTableCurrency();
          cryptoBoardView.renderChart({
            hashTable: Object.assign({}, hashTable),
            type,
            //chartIsBeingUpdated,
            comparisionField,
          });
        }
      });
    },
    filterTableContent() {
      const target = d3.event.target;
      // update the model
      switch(target.getAttribute('id')) {
        case 'market-cap':
          model.cryptoBoard.additionalFilters.keys.marketCap = target.value;
          break;
        case 'price':
          model.cryptoBoard.additionalFilters.keys.price = target.value;
          break;
        case 'volume-24h':
          model.cryptoBoard.additionalFilters.keys.volume_24h = target.value;
          break;
      }

      const { keys, marketCap, price, volume_24h } = model.cryptoBoard.additionalFilters;
      // helper functions
      const defineConstraints = (name, vals, keys) => {
        let min;
        let max;
        if(!!keys[name]) {
            if(vals[keys[name]] instanceof Array) {
              min= vals[keys[name]][0];
              max = vals[keys[name]][1];
            } else min = vals[keys[name]];
        }
        return {
          min,
          max        
        };
      };
      const constraintPasses = (range, item, key) => {
        if(typeof range.min !== 'string') {
          if(
            +item[key] < range.min ||
            +item[key] > range.max
          ) {
            return false;
          }
        }
        return true;
      };

      const marketCapRange = defineConstraints('marketCap', marketCap, keys);
      const priceRange = defineConstraints('price', price, keys);
      const volume_24hRange = defineConstraints('volume_24h', volume_24h, keys);

      const data = model.cryptoBoard.data.filter(item => {        
        return constraintPasses(marketCapRange, item, 'market_cap_usd') &&
               constraintPasses(priceRange, item, 'price_usd') &&
               constraintPasses(volume_24hRange, item, '24h_volume_usd');        
      });
      
      this.renderCryptoBoardTable({
        data,
        currency: 'USD'
      });
    },
    clearTableFilters() {
      d3.event.preventDefault();
      const filters = document.querySelectorAll('.filters--board .additional-filters select');
      const props = Object.keys(model.cryptoBoard.additionalFilters.keys);

      filters.forEach((filter, index) => {
        filter.value = '0';
        model.cryptoBoard.additionalFilters.keys[props[index]] = "0";
      });
      
      this.filterTableContent();
    }
};

controller.init();