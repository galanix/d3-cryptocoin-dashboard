import React from "react";
import ReactDOM from "react-dom";

import * as d3 from "d3";
import {attrs} from "d3-selection-multi";

import PieChart from './children/chartTypes/PieChart.js';
import BarChart from './children/chartTypes/BarChart.js';
import LineChart from './children/chartTypes/LineChart.js';
import HBarChart from './children/chartTypes/HBarChart.js';
import WordLengthTester from './children/chartTypes/children/WordLengthTester.js';

import {twoArraysAreEqual} from '../../../../../helperFunctions.js';

export default class Chart extends React.Component {
  constructor() {
    super();
    this.state = {
      duration: 300,
    };
    this.drawCurrencySign = this.drawCurrencySign.bind(this);
    this.didPropsUpdate = this.didPropsUpdate.bind(this);
    this.determineSign = this.determineSign.bind(this);
    this.recalc = this.recalc.bind(this);
  }
  componentDidMount() {
    if(this.props.immediateRender) {
      this.renderChart(this.props.type, this.props.comparisionField);
    }

    window.addEventListener('resize', () => {
      if(!!this.state.prevType) {
        this.renderChart(this.state.prevType, this.state.prevComparisonField, true);
      }
    });
  }
  renderChart(type, comparisionField, reMountForcefully) {
    let ChartJSX = null;
    let width = Math.round(this.svgDiv.getBoundingClientRect().width);
    if(width > 600) {
      width = 600;
    }

    const height = Math.round(width / 2);
    const keys = Object.keys(this.props.hashTable);
    const dataset = keys.map(key => this.props.hashTable[key]);
    const colorValues = keys.map(key => this.props.hashTable[key].color);
    const color = d3.scaleOrdinal(colorValues);
    const props = {
      dataset,
      width,
      height,
      comparisionField,
      type,
      color: color.bind(this),
      margin: this.props.margin,        
      currentSign: this.props.currentSign,
      determineSign: this.determineSign,
      drawCurrencySign: this.drawCurrencySign,        
      didPropsUpdate: this.didPropsUpdate,
      recalc: this.recalc,
    };

    switch(type) {
      case 'pie':
      case 'pie-donut':
        ChartJSX = ( <PieChart {...props} /> );
        break;

      case 'bar':
        ChartJSX = ( <BarChart {...props} /> );
        break;

      case 'hbar':
        ChartJSX = ( <HBarChart {...props} /> );
        break;

      case 'line':
      case 'line-scatter':
      case 'line-area':
        ChartJSX = ( <LineChart {...props} /> );
        break;

      default:
        console.warn('chart has not been rendered');
    }
  
    const callback = () => {
      this.setState({
        ChildChartJSX: ChartJSX,
        prevType: type,
        prevComparisonField: comparisionField // for resize function
      });
    };

    if(this.state.prevType !== type || reMountForcefully) {
      this.setState({
        ChildChartJSX: null
      }, callback);
    } else {
      callback();
    }
  }
  determineSign(comparisionField) {
    if(
      comparisionField.indexOf('price') === -1
      && comparisionField.indexOf('24h_volume') === -1
      && comparisionField.indexOf('market_cap') === -1
    ) {
        return '%';
    }

    return this.props.currentSign;
  }
  drawCurrencySign(comparisionField, g, pos = {axis: 'y'}) {
    const sign = this.determineSign(comparisionField);
    const yAxis = g.select('g.axis--' + pos.axis);        
    
    if(!yAxis.select('g.currency-sign').node()) {
        yAxis.append('g')
          .attr('class', 'currency-sign')
          .append('text')
            .attrs({
              'fill': '#000',
              'font-size': '18',
              'x': pos.axis === 'x' ? pos.x : 4,                    
            });
    }

    const text = g.select('.currency-sign text');
    const duration = this.state.duration;

    text
      .transition()
      .duration(duration)
      .attr('y', pos.axis === 'x' ? 100 : -100);

    setTimeout(() => {
      text
        .html(sign)
        .transition()
        .duration(duration)
        .attr('y', pos.axis === 'x' ? pos.y : -10);
    }, duration);
  }
  didPropsUpdate(nextProps, currProps) {
    return !(
      twoArraysAreEqual(nextProps.dataset, currProps.dataset)
      && nextProps.comparisionField === currProps.comparisionField
      && nextProps.type === currProps.type
      && nextProps.width === currProps.width  // width can not change without changing height
    );
  }
  recalc(axis, defaultMargin, callbacks) {
    // longest value - pixelwise
    let widestVal = 0;
    axis.selectAll('.tick')
      .each(val => {
        const number = Number(val).toFixed(3);
        const pixelVal = this.WordLengthTester.getLengthOf(typeof number === 'number' ? number : val) + 10; // 10 is for padding
        if(widestVal < pixelVal) {
          widestVal = pixelVal;
        }
      });

    // assign margin.left to longest value to make proper padding
    const margin = defaultMargin;

    if(widestVal > margin.left) {
      margin.left = widestVal;
    }
    
    // call functions that will update properties that are dependant on the margin.left value
    callbacks.forEach(callback => {
      callback(margin);
    });

    return widestVal;
  }
  render() {
    return (
      <div ref={div => this.svgDiv = div} className="graph">
        <WordLengthTester 
          ref={div => this.WordLengthTester = div}          
          fontSize="13px"
        />
        { this.state.ChildChartJSX }
      </div>
    );
  }
}