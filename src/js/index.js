import WaitMessage from './components/WaitMessage';
import Graph from './components/Graph';

import '../scss/index.scss';

import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/material_green.css';

import runTemplateScript from './template';

//runTemplateScript();

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
    // width: 500,
    // height: 250,
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
      this.currencyValueUSD = document.querySelector('.current-price-in-USD .count');
      this.diffNodeUSD = document.querySelector('.current-price-in-USD .count_bottom');
      
      this.currencyValueEUR = document.querySelector('.current-price-in-EUR .count');
      this.diffNodeEUR = document.querySelector('.current-price-in-EUR .count_bottom');        
  },
  renderData({ rateUSD, rateEUR, signsObj }) {
    const transition = 'all .5s ease-in';    
    let highlightColor = '#26B99A';
    const blackColor = '#73879C';

    const setStyle = (styles) => {
      const props = Object.keys(styles);
      props.forEach(prop => {
        this.currencyValueUSD.style[prop] = styles[prop];
        this.currencyValueEUR.style[prop] = styles[prop];
      })
    };
    const insertDiffValue = (node, diff, sign) => {
      node.innerHTML = `
      <i class="${diff > 0 ? 'green' : 'red'}">
        <i class="fa fa-sort-${diff > 0 ? 'asc' : 'desc'}"></i>
        ${sign + Math.abs(diff).toFixed(2)}
      </i>
      From last minute
    `;
    }

    setStyle({
      transition,
      color: highlightColor
    });
    
    setTimeout(() => {
      setStyle({
        color: blackColor
      })
    }, 2500);
    
            
    const prevValUSD = +(this.currencyValueUSD.innerHTML.substr(1));
    const prevValEUR = +(this.currencyValueEUR.innerHTML.substr(1));
    const currValUSD = +this.formatNumber(rateUSD);
    const currValEUR = +this.formatNumber(rateEUR);
    
    if(prevValEUR !== 0 || prevValUSD !== 0) {
      insertDiffValue(this.diffNodeUSD, prevValUSD - currValUSD, signsObj['USD']);
      insertDiffValue(this.diffNodeEUR, prevValEUR - currValEUR, signsObj['EUR']);
    }

    this.currencyValueUSD.innerHTML = signsObj['USD'] + currValUSD;
    this.currencyValueEUR.innerHTML = signsObj['EUR'] + currValEUR;
  },
  formatNumber(numberStr) {
    return (+numberStr.replace(',', '')).toFixed(2);
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
        waitMessageObj: new WaitMessage('#history .graph'),
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
    
    this.graphSVG = d3.select('#history .graph').append('svg');
    // constructed basic graph
    const graphObj = new Graph({
      type: 'bitcoin-rate',
      color: '#c9302c',
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
        
    const paddingValue = 60;
    this.graphSVG
      .attrs({
        width: width + paddingValue * 2, // padding.left + padding.right
        height: height + paddingValue * 2, // padding.top + padding.bottom
        id: 'historical-data',
      })
      .style('padding', paddingValue);

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
    controller.createHashTable(dataset);
    this.addMovableParts({ dataset, height });
  },
  updateLine({ dataset, width, height }) {
    // dataset has changed, need to update #historical-data graph
    this.graphSVG = d3.select('#historical-data');
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
    controller.createHashTable(dataset);
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

    if(!yAxis.select('g#currency-sign').node()) {
      yAxis
      .append('g')
      .attrs({
        'id': 'currency-sign',
      })
      .append('text')
        .attrs({
          'fill': '#000',
          'font-size': '18',
          'x': '4',
          'y': '-10'
        });
    }
    const text = d3.select('#currency-sign text');
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
  addMovableParts({ dataset, height }) {
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

    this.tooltip = d3.select('#history .graph').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

    this.dot = d3.select('#historical-data').append('circle')
      .attrs({
        r: 5,
        'class': 'dot',
        'fill': '#26B99A'
      })
      .style('opacity', 0);
        

    const svgEl = d3.select('#historical-data').node();
    const graphSVGStyles = getComputedStyle(this.graphSVG.node());    
    this.graphSVG
      .on('mousemove', () => {
        const paddingLeft = parseInt(graphSVGStyles.paddingLeft);
        const offsetLeft = svgEl.getBoundingClientRect().left;
        let xPos = Math.round(d3.event.clientX - offsetLeft - paddingLeft);                
        const hashTable = controller.getModelData({ namespace: 'history', prop: 'hashTable' });

        const graphWidth = parseInt(graphSVGStyles.width);
        const padRight = parseInt(graphSVGStyles.paddingRight);
        const padLeft = parseInt(graphSVGStyles.paddingLeft);
        
        if(
          xPos > (graphWidth - padRight - padLeft + 10) ||
          xPos < -10
        ) {          
          this.hideDotsAndTooltip();
          return;
        }

        let rightDist = xPos;
        let leftDist = xPos;
        let valueKey;

        // looks for closest point relative to the mouse
        while( !hashTable['' + leftDist] && leftDist < (graphWidth - padRight - padLeft + 10) ) {
          leftDist++;
        }
        while( !hashTable['' + rightDist] && rightDist > -10 ) {
          rightDist--;
        }                
        if(rightDist < leftDist) valueKey = rightDist; 
        else valueKey = leftDist;
        
        const value = hashTable['' + valueKey];
        if(!!value) {
          this.showDotsAndTooltip(Object.assign({}, value));
        } else {
          this.hideDotsAndTooltip();
        }

        d3.select('#movable')
          .attrs({
            'transform': `translate(${xPos}, 0)`,
        });                
      })
      .on('mouseout', () => {
        this.hideDotsAndTooltip();
      });    
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

      const graph = d3.select('#history .graph').node();
            
      const tooltipWidth = parseInt(this.tooltip.style('width'));
      this.tooltip.html(
        `<h4>${this.formProperDateFormat(time.getFullYear(), time.getMonth() + 1, time.getDate())}</h4>
          <strong>Price: ${signsObj[currencyCode] + currencyValue.toFixed(2)}</strong>`
      )
      .style('left', this.xScale(time.getTime()) + tooltipWidth / 2 + 'px')
      .style('top', this.yScale(currencyValue) + 'px')
  },
  hideDotsAndTooltip() {
    d3.select('#movable')
    .attrs({
      'transform': `translate(-999, 0)`,
    })

    d3.selectAll('.dot')         
    .transition()
    .duration(100)
    .style('opacity', 0);                        
  
    this.tooltip.transition()
      .duration(100)
      .style('opacity', 0);             
  },
  formProperDateFormat(year, month, day) { // example: turns 2017, 5, 14 into 2017-05-15
    const dateStr = `${year}-${month < 10 ? ('0' + month) : month}-${day < 10 ? ('0' + day) : day}`;        
    return dateStr;
  },
  attachFiltersEvents() {
    this.prevBtn = d3.select('#history .btn.active').node();

    d3.selectAll('#history .btn-group .btn')
      .on('click', controller.btnGroupClick({
        selector: '#history .btn-group .btn',
        callback: controller.timelineBtnClick.bind(controller)
      }));          
    d3.selectAll('#history .dropdown a')
      .on('click', controller.dropdownChange({
        selector: '#history .dropdown a', 
        callback: controller.currencyDropdownChange
      }));
  },
  changeSelectedButton() {
    // d3.event.preventDefault();      
    const btn = d3.event.target;
    if(btn !== this.prevBtn) {
      this.prevBtn.classList.remove('active');
      btn.classList.add('active');
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
        waitMessageObj: new WaitMessage('#currency-pair .graph'),
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
    this.graphSVG = d3.select('#currency-pair .graph').append('svg');
    this.makeScales({ dataset, width, height });

    const paddingValue = 60;
    this.graphSVG
      .attrs({
        width: width + paddingValue * 2,
        height: height + paddingValue * 2,
        id: 'ask-bid-spread-graph',
      })
      .style('padding', paddingValue);

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

    this.graphSVG = d3.select('#ask-bid-spread-graph');
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
    d3.selectAll('.toggle-graphs label')
      .on('click', () => this.toggleGraph());

    d3.select('#spread')
      .on('click', () => controller.adjustForSpreadGraph());

    d3.selectAll('#currency-pair .dropdown_currency a')
      .on('click', controller.dropdownChange({
        selector: '#currency-pair .dropdown_currency a',
        callback: controller.changePairName.bind(controller)
      }));
      //.on('click', () => controller.changePairName()); 

    d3.selectAll('#currency-pair .dropdown_frequency a')
      .on('click', controller.dropdownChange({
        selector: '#currency-pair .dropdown_frequency a',
        callback: controller.changeDataPointsFreq.bind(controller)
      }));
      //.on('click', () => controller.changeDataPointsFreq());    
    
    d3.selectAll('#currency-pair #hours-input')
      .on('submit', () => controller.changeHours());
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
  createGraphInstances(dataset) {
  
    const ask = new Graph({
      type: 'ask',
      color: '#31b0d5',
      hidden: false,
      lineFunction:  d3.line()
                       .x(d => this.xScale(new Date(d.created_on).getTime()))
                       .y(d => this.yScale(+d.ticker.ask)),
      container: this.graphSVG
    });
    ask.append(dataset);

    const bid = new Graph({
      type: 'bid',
      color: '#c9302c',
      hidden: false,
      lineFunction: d3.line()
                      .x(d => this.xScale(new Date(d.created_on).getTime()))
                      .y(d => this.yScale(+d.ticker.bid)),
      container: this.graphSVG
    });
    bid.append(dataset,);

    const spread = new Graph({
      type: 'spread',
      color: '#26B99A',
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
    let target = d3.event.target;
    if(target.tagName !== 'LABEL') target = target.parentElement;

    const active = target.classList.contains('active');
    d3.select('#graph-type--' + target.id)
      .transition()
      .duration(600)
      .style('opacity', active ? 0 : 1);

    const graphInstance = controller.getModelData({ namespace: 'currencyPair', prop: 'graphs' })[target.id];
    graphInstance.hidden = active;
  },
   //minFuncForY() {}
};

const cryptoBoardView = {
  init() {
    this.subMenu = document.getElementsByClassName('modal-window')[0];
    this.modalBtn = document.getElementById('modal-button');
    this.cancelBtn = document.getElementById('cancel-button');
    this.buildBtn = document.getElementById('build-button');
    
    this.boardBody = document.querySelector('#board-of-crypto-currencies tbody');

    const waitMessageObj = new WaitMessage('#board-of-crypto-currencies .graph');
    waitMessageObj.hide();    

    controller.setModelData({
      namespace: 'cryptoBoard',
      params: {
        currency: 'USD',
        limit: 100,
        chart: {
          hashTable: JSON.parse(window.localStorage.getItem('hashTable')) || {},
          chartData: {},
          currency: 'USD',
          type: 'bar',
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
      if(!item.index) item.index = index;      
      const tr = document.createElement('tr');      
      tr.className = 'board-row';
      tr.innerHTML = `
        <td data-toggle="button">
            <button class="btn btn-xs btn-dark" data-index="${item.index}" data-currency-id="${item.id}">
              <span class="fa fa-check"></span>
            </button>
        </td>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item['market_cap_' + currency.toLowerCase()]}</td>
        <td>${(+item['price_' + currency.toLowerCase()]).toFixed(5)}</td>
        <td>${item.available_supply}</td>
        <td>${item['24h_volume_' + currency.toLowerCase()]}</td>
        <td>${item.percent_change_1h}</td>
        <td>${item.percent_change_24h}</td>
        <td>${item.percent_change_7d}</td>
      `;
      this.boardBody.appendChild(tr);
    });
    d3.selectAll('td .btn')
      .on('click', () => controller.toggleItemForGraphDraw());

    this.checkPreviousItems();
  },
  checkPreviousItems() {
    const hashTable = model.cryptoBoard.chart.hashTable;    
    const keys = Object.keys(hashTable);
    const checkboxes = [].slice.call(this.boardBody.getElementsByClassName('btn'));
    if(checkboxes.length >= keys.length) {
      keys.forEach(key => {
        if(checkboxes[+key].getAttribute('data-currency-id') === hashTable[key].id) checkboxes[+key].classList.add('active');
      });
      if(keys.length > 1) this.enableBtn(this.modalBtn);        
      else {
        this.disableBtn(this.buildBtn);
        this.disableBtn(this.modalBtn);
      }
    }
  },
  attachFiltersEvents() {
    d3.selectAll('#board-of-crypto-currencies .dropdown_table-currency a')
    .on('click', controller.dropdownChange({
      selector: '#board-of-crypto-currencies .dropdown_table-currency a',
      callback: controller.changeTableCurrency.bind(controller)
    }));     
    
    const selectors = [
      '#board-of-crypto-currencies .dropdown_market-cap a',
      '#board-of-crypto-currencies .dropdown_price a',
      '#board-of-crypto-currencies .dropdown_volume-24h a'
    ];
    selectors.forEach(selector => {
      d3.selectAll(selector)
      .on('click', controller.dropdownChange({
        selector,
        callback: controller.filterTableContent.bind(controller)
      }));    
    });

    d3.selectAll('#board-of-crypto-currencies .modal-window .dropdown_chart-currency a')
      .on('click', controller.dropdownChange({
        selector: '#board-of-crypto-currencies .modal-window .dropdown_chart-currency a',
        callback: controller.changeGraphCurrency.bind(controller)
       }));      

    d3.select('#reset_dropdown-group')
    .on('click', () => controller.clearTableFilters());

    this.modalBtn.addEventListener('click', evt => this.showModalWindow(evt));

    this.cancelBtn.addEventListener('click', () => this.hideModalWindow());
    
    this.buildBtn.addEventListener('click', evt => controller.buildChart(evt));

    d3.selectAll('#board-of-crypto-currencies .table-length .btn')
      .on('click', controller.btnGroupClick({
        selector: '#board-of-crypto-currencies .table-length .btn',
        callback: controller.changeTableLength.bind(controller)
      }));
    d3.selectAll('#board-of-crypto-currencies .category .btn')
      .on('click', controller.btnGroupClick({
        selector: '#board-of-crypto-currencies .category .btn',
        callback: controller.changeComparisionField.bind(controller)
      }));
    d3.selectAll('#board-of-crypto-currencies .type .btn')
      .on('click', controller.btnGroupClick({
        selector: '#board-of-crypto-currencies .type .btn',
        callback: controller.changeChartType.bind(controller)
      }));
  },
  showModalWindow(evt) {
    if(evt.target.classList.contains('disabled')) {
      return;
    }    
    this.subMenu.style.paddingTop = '19px';    
    this.subMenu.style.paddingBottom = '19px';
    this.subMenu.style.maxHeight = '2000px';    
    this.subMenu.style.minHeight = '20px';
  },
  hideModalWindow() {
    this.subMenu.style.paddingTop = '0';
    this.subMenu.style.paddingBottom = '0';
    this.subMenu.style.maxHeight = '0';
    this.subMenu.style.minHeight = '0';
  },
  enableBtn(btn) {
    btn.classList.remove('disabled');
  },
  disableBtn(btn) {
    btn.classList.add('disabled');
  },
  midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  },
  renderChart({ hashTable, type, comparisionField }) {
    if(!this.chartSVG) this.chartSVG = d3.select('#board-of-crypto-currencies .graph').append('svg').attr('id', 'crypto-chart');
    if(!this.legend) this.legend = d3.select('#board-of-crypto-currencies .graph').append('div').attr('class', 'legend');

    const width = Math.round(document.querySelector('#board-of-crypto-currencies .graph').getBoundingClientRect().width);
    //if(width > 380) width = 380;
    const height = Math.round(width / 2);

    //const paddingValue = 60;
    this.chartSVG .attrs({
      width: width,
      height: height
    })
    //.style('padding', paddingValue);
    
    //this.legend.style('width', width + 'px')// + paddingValue * 2 + 'px');

    const keys = Object.keys(hashTable);
    const dataset = keys.map(key => hashTable[key]);
    const colorValues = keys.map(key => hashTable[key].color);

    this.chartSVG.selectAll('*').remove();
    this.legend.selectAll('*').remove();
    this.color = d3.scaleOrdinal(colorValues);
    let hoverCallback;
    switch(type) {
      case 'pie':
        this.renderPieChart({ dataset, width, height, comparisionField });
        hoverCallback = this.handleHoverEventPie.bind(this)
        break;
      case 'bar':
        this.renderBarChart({ dataset, width, height, comparisionField });
        hoverCallback = this.handleHoverEventBar.bind(this);
        break;
    }
    
    // BUILDING THE LEGEND
    this.buildLegendSection({
      dataset,
      comparisionField,
      handleHoverEvent: hoverCallback
    });

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
    const items = this.legend.selectAll('.legend_item')
      .data(dataset)
      .enter()
      .append('div')
      .attrs({
        'data-index': () => index++,
        'class': 'legend_item',
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
  // PIE/DONUT
  renderPieChart({ dataset, width, height, comparisionField }) {
    this.radius = Math.round(width / 4);
    if(this.radius > 150) {
      //width = 600;
      //height = width / 2;
      this.radius = 150; // Math.round(width / 4);
    }
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
      //.each(function(d) { this._current = d; }); // store the initial angles

    this.appendPieSlices(arc, comparisionField);        
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
    const margin = {top: 30, right: 10, bottom: 50, left: 50};    
    width -= (margin.left + margin.right);
    height -= (margin.top + margin.bottom);

    let max = d3.max(dataset, d => +d[comparisionField]);
    max = max < 0 ? 0 : max;
    let min = d3.min(dataset, d => +d[comparisionField]);
    min = min > 0 ? 0 : min;
    
    const yScale = d3.scaleLinear()
      .domain([min, max])     
      .range([height, 0])
      .nice();    
    
    const xScale = d3.scaleBand()
      .domain(dataset.map((_d, i) => ++i))
      .padding(0.2)
      .rangeRound([0, width], 0.2);

    const g = this.chartSVG.append('g')
      .attrs({
        'transform': `translate(${margin.left}, ${margin.top})`,
        'class': 'bar'
      });
      
    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale))
      .style('shape-rendering', 'crispEdges');
      
    g.append('g')
      .attr('class', 'axis axis--x axis--zero')
      .attr('transform', `translate(0, ${yScale(0)})`)
      .style('opacity', 0.4)
      .call(d3.axisBottom(xScale).tickFormat('').tickSize(0));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale).ticks(10))      

    const bars = g.selectAll('.col')
      .data(dataset)
      .enter()
      .append('g')
      .attr('class', 'col');
     
    bars
      .append('rect')
      .attrs({
        'fill':  d => this.color(+d[comparisionField]),
        'width': xScale.bandwidth(),
        'data-index': (_d,i) => i,
        'x': (_d,i) => xScale(++i),
        'y': d => +d[comparisionField] < 0 ? (yScale(0)) :  yScale(+d[comparisionField]),
        'height': d => Math.abs(yScale(+d[comparisionField]) - (yScale(0))),
      })
      .on('mouseover', d => this.toggleBarLabel(d3.event.target.getAttribute('data-index'), d, comparisionField))
      .on('mouseout', d => this.toggleBarLabel(d3.event.target.getAttribute('data-index'), d, comparisionField, true));     
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
      const state = JSON.parse(window.localStorage.getItem('componentState')) || {
        currentPriceView: false,
        historyView: true,
        currencyPairView: true,
        cryptoBoardView: true,
      };    
      
      this.animatedScrollToTarget();

      currentPriceView.init();
      if(state.currentPriceView) {
        model.startFetchingData();
        this.showComponent(document.getElementById('bitcoin-current-price').parentElement);
      }
      else {
        this.hideComponent(document.getElementById('bitcoin-current-price').parentElement);
        console.warn('currentPriceView not displayed, go to settings to change that');
      }

      //request data for history graph
      historyView.init();
      if(state.historyView) {
        model.requestModuleData({
          url: this.createHistoryURL(),
          isModuleBeingUpdated: false,
          namespace: model.history,
          callback: this.renderHistoryGraph,
        });
        this.showComponent(document.getElementById('history').parentElement);
      } else {        
        this.hideComponent(document.getElementById('history').parentElement);
        console.warn('historyView not displayed, go to settings to change that');
      }

      //request data for currency pair graph
      currencyPairView.init();
      if(state.currencyPairView) {
        model.requestModuleData({
          url: this.createCurrencyPairURL(),
          isModuleBeingUpdated: false,
          namespace: model.currencyPair,
          callback: this.renderCurrencyPairGraph,
        });
        this.showComponent(document.getElementById('currency-pair').parentElement);
      } else {        
        this.hideComponent(document.getElementById('currency-pair').parentElement);
        console.warn('currencyPairView not displayed, go to settings to change that');
      }

      //request data for cryptoboard graph
      cryptoBoardView.init();
      if(state.cryptoBoardView) {
        model.requestModuleData({
          url: this.createCryptoBoardURL(),
          // isModuleBeingUpdated: false,
          namespace: model.cryptoBoard,
          callback: this.renderCryptoBoardTable,
        });
        this.showComponent(document.getElementById('board-of-crypto-currencies').parentElement);
      } else {        
        this.hideComponent(document.getElementById('board-of-crypto-currencies').parentElement);
        console.warn('cryptoBoardView not displayed, go to settings to change that');
      }            
    },
    // general methods
    hideComponent(element) {
      element.style.display = 'none'
    },
    showComponent(element) {
      element.style.display = 'block';
    },
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
    dropdownChange({ selector, callback }) {
      let prevAnchorTag = d3.select(selector).node();
      const btn = prevAnchorTag.parentElement.parentElement.parentElement.querySelector('button');
      const currDropdownVal = document.createElement('span');
      
      prevAnchorTag.classList.add('active');    
      currDropdownVal.textContent = prevAnchorTag.textContent;     
      btn.insertBefore(currDropdownVal, btn.querySelector('span'));
      
      return () => {
        prevAnchorTag.classList.remove('active');
        d3.event.target.classList.add('active');
        prevAnchorTag = d3.event.target;
        currDropdownVal.textContent = d3.event.target.textContent;
        if(!!callback) callback(); // actual event handling
      }
    },
    btnGroupClick({ selector, callback }) {
      let prevBtn = d3.select(selector + '.active').node();      
      if(!prevBtn) prevBtn = d3.select(selector).node();

      prevBtn.classList.add('active');
      return () => {
        const currBtn = d3.event.target
        currBtn.classList.add('active');
        prevBtn.classList.remove('active');
        prevBtn = currBtn;
  
        if(!!callback) callback();
      };
    },        
    // currentPriceView
    renderCurrentPrice() {
      currentPriceView.renderData({
          rateEUR: model.currentPrice.data.bpi.EUR.rate,
          rateUSD: model.currentPrice.data.bpi.USD.rate,
          signsObj: model.general.currencySigns      
      });
    },
    // historyView
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
        model.history.currency = d3.event.target.getAttribute('data-value');
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
      inputs[0].placeholder = 'From : ' + model.history.start;
      inputs[1].placeholder = 'To : ' + model.history.end;
  
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
    createHashTable(dataset) {
      const hashTable = {};
      dataset.forEach(item => {
        hashTable[Math.round(historyView.xScale(item.time.getTime()))] = {
          currencyValue: item.currencyValue,
          time: item.time,
        }
      });   
      model.history.hashTable = hashTable;
    },
    createHistoryURL() {
      const { url, start, end, currency } = model.history;
      return url + `?start=${start}&end=${end}&currency=${currency}`;
    },
    renderHistoryGraph(isModuleBeingUpdated) {
      const data = model.history.data;
      
      let width = Math.round(document.querySelector('#history .graph').getBoundingClientRect().width);       
      if(width > 380) width = 380;
      const height = Math.round(width / 2);
      historyView.renderGraph({
          width,
          height,
          data: data.bpi,
          isModuleBeingUpdated           
      });
    },
    // currencyPairGraphView
    createCurrencyPairURL() {
      const { pairName, dataPoints, hours } = model.currencyPair;
      return `https://api.nexchange.io/en/api/v1/price/${pairName}/history/?data_points=${dataPoints}&format=json&hours=${hours}`;
    },        
    renderCurrencyPairGraph(isModuleBeingUpdated) {
      const data = model.currencyPair.data;
      let width = Math.round(document.querySelector('#currency-pair .graph').getBoundingClientRect().width);
      if(width > 380) width = 380;
      const height = Math.round(width / 2);
      currencyPairView.renderGraph({
        width,
        height,
        dataset: data,
        isModuleBeingUpdated
      });
    },       
    changePairName() {
      model.currencyPair.pairName = d3.event.target.getAttribute('data-value');      
      this.updateGraphData({
        namespace: model.currencyPair,
        callback: this.renderCurrencyPairGraph
      });
    },
    changeHours() {
      d3.event.preventDefault();

      const input = d3.event.target.getElementsByTagName('input')[0];
      const hours = +input.value;
      const divisor = model.currencyPair.currentDivisor;
      
      input.placeholder = hours + ' Hours'
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
      const frequency = d3.event.target.getAttribute('data-value') || '';      
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
      let active = false;
      if(!!d3.event) {
        let target = d3.event.target;
        if(target.tagName !== 'LABEL') target = target.parentElement; 
        active = !(target.classList.contains('active'));
      }
      model.currencyPair.graphs['spread'].hidden = !active;      
      
      const data = model.currencyPair.data;
      let width = Math.round(document.querySelector('#currency-pair .graph').getBoundingClientRect().width);
      if(width > 380) width = 380;      
      const height = Math.round(width / 2);
      
      self.updateLines({ dataset: data, width, height });
    },    
    // cryptoBoardView
    renderCryptoBoardTable(customParams) {
      const { data, currency } = !!customParams ? customParams : model.cryptoBoard;
      cryptoBoardView.renderTable({
        dataset: data,
        currency,
      });
    }, 
    createCryptoBoardURL(customCurrency) {
      let { url, currency, limit } = model.cryptoBoard;
      if(!!customCurrency) {
        currency = customCurrency;
      }
      return url + `?convert=${currency}&limit=${limit}`;
    }, 
    changeTableLength() {
      // d3.event.preventDefault();
      model.cryptoBoard.limit = +(d3.event.target.getAttribute('data-value'));
      model.requestModuleData({
        url: this.createCryptoBoardURL(),
        namespace: model.cryptoBoard,
        callback: () => {
          this.renderCryptoBoardTable();
          this.filterTableContent();
        },
      });
    },
    changeTableCurrency() {
      model.cryptoBoard.currency = d3.event.target.getAttribute('data-value');

      model.requestModuleData({
        url: this.createCryptoBoardURL(),        
        namespace: model.cryptoBoard,
        callback: this.renderCryptoBoardTable,
      });
    },
    toggleItemForGraphDraw() {
      //debugger;
      let target = d3.event.target;
      if(target.tagName !== 'BUTTON') target = target.parentElement;

      const newKey = +target.getAttribute('data-index');            
      const checked =  !target.classList.contains('active');      
      const hashTable = model.cryptoBoard.chart.hashTable;
      const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      };
      if(checked) {
        // add
        let generatedColor;
        let colorIsDuplicated = false;
        const keys = Object.keys(hashTable);
        do {
          generatedColor = getRandomColor();
          keys.forEach(key => {
            if(hashTable[key].color === generatedColor) {
              colorIsDuplicated = true;
            }
          })
        } while(colorIsDuplicated);        
        hashTable[newKey] = model.cryptoBoard.data[newKey];
        hashTable[newKey].color = generatedColor;

      } else {
        // remove
          delete hashTable[newKey];
      }
      
      const viewObj = cryptoBoardView;
      if(Object.keys(hashTable).length > 1) {
        // display that submenu
        viewObj.enableBtn(viewObj.modalBtn);
        viewObj.enableBtn(viewObj.buildBtn);
      } else {
        // hide that submenu
        viewObj.disableBtn(viewObj.modalBtn);
        viewObj.disableBtn(viewObj.buildBtn);
      }

      window.localStorage.setItem('hashTable', JSON.stringify(hashTable));
      console.log(JSON.parse(window.localStorage.getItem('hashTable')));
    },
    changeGraphCurrency() {
      const value = d3.event.target.getAttribute('data-value');
      const comparisionField = model.cryptoBoard.chart.comparisionField;

      if(model.cryptoBoard.chart.currency !== value) {
        model.cryptoBoard.chart.currency = value;
        if(
          comparisionField.indexOf('price') !== -1 ||
          comparisionField.indexOf('volume_24h') !== -1 ||
          comparisionField.indexOf('market_cap') !== -1
        ) {
          // we need to change the last three chars as they represent currency
          model.cryptoBoard.chart.comparisionField = comparisionField.substr(0, comparisionField.length - 3) + value.toLowerCase();
        }
      }
    },
    changeHashTableCurrency() {
      if(model.cryptoBoard.chart.currency === model.cryptoBoard.currency) {
        return; // no need for changing data
      }
      // rewrite hashtable with the data that user has set and not the one that was in the table
      const keys = Object.keys(model.cryptoBoard.chart.hashTable);
      keys.forEach(key => {
        const color = model.cryptoBoard.chart.hashTable[key].color; // preserve color as it is not part of the data object
        model.cryptoBoard.chart.hashTable[key] = model.cryptoBoard.chart.data[key];
        model.cryptoBoard.chart.hashTable[key].color = color;
      });
    },
    changeComparisionField() {
      // d3.event.preventDefault();
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
      // d3.event.preventDefault();            
      model.cryptoBoard.chart.type = d3.event.target.getAttribute('data-type');      
    },
    buildChart(evt) {
      if(evt.target.classList.contains('disabled')) {
        return;
      }

      const { currency, type, comparisionField } = model.cryptoBoard.chart;
      model.requestModuleData({
        url: this.createCryptoBoardURL(currency),
        namespace: model.cryptoBoard.chart,
        callback: () => {
          this.changeHashTableCurrency();          
          cryptoBoardView.renderChart({
            hashTable: Object.assign({}, model.cryptoBoard.chart.hashTable),
            type,
            comparisionField,
          });
        }
      });
    },
    filterTableContent() {
      if(!!d3.event) {
        const target = d3.event.target;
        const greatGreatParent = target.parentElement.parentElement.parentElement;      
        // update the model
        if(greatGreatParent.classList.contains('dropdown_market-cap')) {
          model.cryptoBoard.additionalFilters.keys.marketCap = target.getAttribute('data-value');
        } else if(greatGreatParent.classList.contains('dropdown_price')) {
          model.cryptoBoard.additionalFilters.keys.price = target.getAttribute('data-value');
        } else if(greatGreatParent.classList.contains('dropdown_volume-24h')) {
          model.cryptoBoard.additionalFilters.keys.volume_24h = target.getAttribute('data-value');
        }
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
      const props = Object.keys(model.cryptoBoard.additionalFilters.keys);
      props.forEach(prop =>  model.cryptoBoard.additionalFilters.keys[prop] = "0");     
      this.filterTableContent();
    },
    animatedScrollToTarget() {
      const componentLinks = document.querySelectorAll("a[data-linksTo]");
      componentLinks.forEach(link => link.addEventListener("click", evt => {
        scrollIt(
          document.getElementById(evt.target.getAttribute('data-linksTo')),
          300         
        );
      }));

      const scrollIt = (destination, duration = 200, callback) => {
        const easingFunc = t =>  t * (2 - t);
      
        const start = window.pageYOffset;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
      
        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

        let destinationOffset = destination.getBoundingClientRect().top;
        if(destinationOffset < 0) destinationOffset = destination.offsetTop;

        const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);        
        if ('requestAnimationFrame' in window === false) {
          window.scroll(0, destinationOffsetToScroll);
          if (callback) {
            callback();
          }
          return;
        }
      
        function scroll() {
          const now = 'now' in window.performance ? performance.now() : new Date().getTime();
          const time = Math.min(1, ((now - startTime) / duration));
          const timeFunction = easingFunc(time);
          window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));
      
          if (window.pageYOffset === destinationOffsetToScroll) {
            if (callback) {
              callback();
            }
            return;
          }
      
          requestAnimationFrame(scroll);
        }
      
        scroll();
      };     
    },  
};

controller.init();