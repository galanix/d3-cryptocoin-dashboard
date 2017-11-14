import React from 'react';

import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';

import WaitMessage from '../../../General/WaitMessage';

import Graph from '../../../../components/Graph';
import { formProperDateFormat, removeDuplicates, formTickValues } from '../../../../helperFunctions';

export default class LineChart extends React.Component {
  componentDidMount() {
    this.hidePreloader();
  }
  buildLine(dataset) {
    let width = Math.round(this.container.getBoundingClientRect().width);
    if(width > 600) {
      width = 600;
    } else if(width < 500) {
      width = 500;
    }

    const margin = this.props.model.margin;
    const height = width * 0.6;
    const actualWidth = width - margin.left - margin.right; // get initial width from model
    const actualHeight = height - margin.top - margin.bottom;

    this.setState({ width, height });
              
    this.makeScales(dataset, actualWidth, actualHeight);

    const svg = d3.select(this.svg);
    svg.attrs({
      width,
      height,
      id: 'historical-data'
    });

    // instantiate basic graph
    // wrap it in a function to make look cleaner
    const createGraphObj = () => {
      const lineGraph = new Graph({
        type: 'bitcoin-rate',
        color: '#c9302c',
        hidden: false,
        lineFunction:  d3.line()
          .x(d => this.xScale(d.time.getTime()))
          .y(d => this.yScale(d.currencyValue)),
        container: this.state.g,
      });
      lineGraph.append(dataset);
      this.setState({ lineGraph, });
    };

    this.setState({
      g: svg.append('g')
           .attr('transform', `translate(${margin.left}, ${margin.top})`)
    }, () => {
      createGraphObj();

      this.appendAxises(dataset, actualHeight);
      this.drawCurrencySign();
      this.createHashTable(dataset, this.addMovableParts.bind(this)); // add movable after it 
    });
  }
  updateLine(dataset) {
    if(!this.state) {
      this.buildLine(dataset);
    }

    const margin = this.props.model.margin;      
    const { width, height, lineGraph, g } = this.state;
    const actualWidth = width - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;

    // do the updating

    lineGraph.update(dataset);

    this.makeScales(dataset, actualWidth, actualHeight);

    this.appendAxises(dataset, actualHeight);
    this.drawCurrencySign();
    this.createHashTable(dataset);               
  }
  makeScales(dataset, width, height) {
    // dates are in chronological order
    const firstDate = dataset[0].time.getTime();
    const lastDate = dataset[dataset.length - 1].time.getTime();
    this.xScale = d3.scaleLinear().domain([ firstDate, lastDate ]).range([ 0, width ]);
    this.yScale = d3.scaleLinear().domain(d3.extent(dataset, d => d.currencyValue)).range([ height, 0 ]);
  }
  appendAxises(dataset, actualHeight) {
    const { yTickValues, xTickValues, ticksFormat } = this.determineTicks(dataset);
    const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTickValues).tickFormat(d3.format('.2f'));
    const xAxisGen = d3.axisBottom(this.xScale).tickValues(xTickValues).tickFormat(d3.timeFormat(ticksFormat));
    const g = this.state.g;
    const duration = 1000;

    // Y AXIS
    let yAxis = g.select('g.y-axis');
    if(!yAxis.node()) {
      yAxis =  g.append('g').attr('class', 'y-axis');
    }
    yAxis
      .transition()
      .duration(duration)
      .call(yAxisGen);
    
    // X AXIS
    let xAxis = g.select('g.x-axis');
    if(!xAxis.node()) {
      xAxis = g.append('g')
        .attrs({
          'transform': `translate(0, ${actualHeight})`,
          'class': 'x-axis'
        });
    }
    xAxis
      .transition()
      .duration(duration)
      .call(xAxisGen)
      
  }
  createHashTable(dataset, callback) {
    const hashTable = {};
    dataset.forEach(item => {
      hashTable[Math.round(this.xScale(item.time.getTime()))] = {
      currencyValue: item.currencyValue,
      time: item.time,
      }
    });
    this.setState({
      hashTable
    }, () => { if(callback) callback(dataset); });
  }
  determineTicks(dataset) {
    const ticksFormat = this.props.model.ticksFormat[this.props.model.filters.currentTimeline];
    const ticksLevel = this.props.model.ticksLevel;      
    
    const yTickValues = formTickValues({ // outputs an array of evenly distributed values between prevSm and prevLg
      finalLevel: ticksLevel,
      level: 1,
      prevSm: d3.max(dataset, d => d.currencyValue),
      prevLg: d3.min(dataset, d => d.currencyValue),
    });

    const xTickValues = formTickValues({
      finalLevel: ticksLevel,
      level: 1,
      prevSm: dataset[0].time.getTime(),
      prevLg: dataset[dataset.length - 1].time.getTime(),
    });

    return {
      yTickValues,
      xTickValues,
      ticksFormat,
    };
  }
  drawCurrencySign() {
    const g = this.state.g;
    const yAxis = g.select('g.y-axis');
  
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

    const text = g.select('#currency-sign text');
    text
      .transition()
      .duration(500)
      .attrs({
        y: '-100'
      });
    setTimeout(() => {
      text
        .html(this.props.signs[this.props.model.filters.currency])
        .transition()
        .duration(500)
        .attrs({
            y: '-10'
        })
    }, 500);
  }
  addMovableParts(dataset) {
    const svg = d3.select(this.svg);
    const g = this.state.g;
    const margin = this.props.model.margin;      
    const lineFunction = d3.line()
      .x(d => 0)
      .y(d => this.yScale(d.currencyValue));
      
    const hoverG = g.append('g');        
    
    hoverG.append('path')
      .attrs({
        'd': lineFunction(dataset),
        'stroke': '#717A84',
        'stroke-width': 2,
        'fill': 'none',
        'id': 'movable',
        'transform': `translate(-100, 0)`,
      });
      
    hoverG.append('circle')
      .attrs({
        'r': 5,
        'class': 'dot',
        'fill': '#26B99A'
      })
      .style('opacity', 0);      

    d3.select(this.container).append('div') // adding tooltip
      .attr('class', 'tooltip')
      .style('opacity', 0);
          
    svg.on('mousemove', () => {
      if(this.state.timeoutId) { 
        clearTimeout(this.state.timeoutId); 
      } // reset time

      const svgDOMRect = svg.node().getBoundingClientRect();
      const offsetLeft = svgDOMRect.left;
      const svgWidth = svgDOMRect.width;

      const hashTable = this.state.hashTable;
      let xPos = Math.round(d3.event.clientX - offsetLeft - margin.left);
            
      if(
          xPos > svgWidth - margin.right - margin.left + 10 // 10 is for padding
          || xPos < 0
      ) {
        this.hideDotsAndTooltip();
        return;
      }

      let rightDist = xPos;
      let leftDist = xPos;
      let valueKey;

      // looks for closest point relative to the mouse
      while( !hashTable[String(leftDist)] && leftDist < (svgWidth + 10) ) {
        leftDist += 1;
      }
      while( !hashTable[String(rightDist)] && rightDist > -10 ) {
        rightDist -= 1;
      }
      if(rightDist < leftDist) {
        valueKey = rightDist;
      }
      else {
        valueKey = leftDist;
      }
      
      const value = hashTable[String(valueKey)];
      if(!!value) {
        this.showDotsAndTooltip(Object.assign({}, value));``
      } else {             
        this.hideDotsAndTooltip();
      }

      g.select('#movable')
          .attrs({
            'transform': `translate(${xPos}, 0)`,
          });
      
      this.setState({ timeoutId: setTimeout(() => this.hideDotsAndTooltip(), 3000) });
    });
  }
  showDotsAndTooltip({ time, currencyValue }) {
    // debugger;
    const g = this.state.g;

    g.selectAll('.dot')
      .attrs({
          cy: this.yScale(currencyValue),
          cx: this.xScale(time.getTime())
      })
      .transition()
      .duration(100)
      .style('opacity', 0.9);
    
    const tooltip = d3.select(this.container).select('.tooltip');

    tooltip
      .transition()
      .duration(100)
      .style('opacity', 0.9);
                
    tooltip.html(
      `<h4>${formProperDateFormat(time.getFullYear(), time.getMonth() + 1, time.getDate())}</h4>
        <strong>Price: ${this.props.signs[this.props.model.filters.currency] + currencyValue.toFixed(2)}</strong>`);

    tooltip
      .style('left', this.xScale(time.getTime()) + parseInt(getComputedStyle(tooltip.node()).width) / 2 + 'px')
      .style('top', this.yScale(currencyValue) + 'px');
  }
  hideDotsAndTooltip() {
    const g = this.state.g;

    g.select('#movable')
      .attr('transform', `translate(-999, 0)`);

    g.selectAll('.dot')
      .transition()
      .duration(300)
      .style('opacity', 0);

    d3.select(this.container).select('.tooltip')
      .transition()
      .duration(300)
      .style('opacity', 0);
  }
  showPreloader() {
    this.WaitMessage.show();
  }
  hidePreloader() {
    this.WaitMessage.hide();
  }
  render() {
    return (
      <div className="graph" ref={container => this.container = container}>
        <svg ref={svg => this.svg = svg}></svg>
        <WaitMessage ref={WaitMessage => this.WaitMessage = WaitMessage} msg="Wait, please"/>
      </div>
    );
  }
};