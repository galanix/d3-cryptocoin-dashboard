import React from "react";
import ReactDOM from "react-dom";

import * as d3 from "d3";
import {attrs} from "d3-selection-multi";

import PieChart from './children/chartTypes/PieChart.js';
import BarChart from './children/chartTypes/BarChart.js';
import LineChart from './children/chartTypes/LineChart.js';
import HBarChart from './children/chartTypes/HBarChart.js';
import WordLengthTester from './children/chartTypes/children/WordLengthTester.js';

import { twoArraysAreEqual } from '../../../../../helperFunctions.js';

export default class Chart extends React.Component {
  constructor() {
    super();
    this.state = {
      duration: 300,
      maxWidth: 600,
      minWidth: 450,
      prevType: 'bar',
      chartIsRendered: false,      
    };
    this.drawCurrencySign = this.drawCurrencySign.bind(this);
    this.didPropsUpdate = this.didPropsUpdate.bind(this);
    this.determineSign = this.determineSign.bind(this);
    this.recalc = this.recalc.bind(this);
  }
  componentDidMount() {
    if (this.props.immediateRender) {
      this.renderChart(this.props.type, this.props.comparisionField);
    }

    window.addEventListener('resize', () => {
      if (this.state.chartIsRendered) {
        setTimeout(() => {
          this.renderChart(this.state.prevType, this.state.prevComparisonField, true);
        }, this.state.duration);
      }
    });
  }
  refreshData() {
    // we are provided with hashTable
    // based on which we can build a graph
    // but we do not know when was this hashTable created
    // data in it may be outdated
    // so we need to use given hashTable as a base
    // fetch new data and return new fresh version of hashTable
    return new Promise((resolve, reject) => {
      let freshHashTable = {};
      const hashTableItemIds = Object.keys(this.props.hashTable);
      fetch(this.props.url)
        .then(res => res.json())
        .then((dataset) => {
          hashTableItemIds.forEach((id) => {
            const foundItem = dataset.find((item => item.id === id));
            if (foundItem) {
              foundItem.color = this.props.hashTable[id].color;
              freshHashTable[id] = foundItem;
            }
          });
          resolve(freshHashTable);
        })
        .catch(err => reject(err));
    });
  }
  renderChart(type, comparisionField, reMountForcefully) {
    // we need to update data!!!
    if (!this.svgDiv) {
      return;
    }

    if (!this.state.chartIsRendered) { // for resize event handler
      this.setState({ chartIsRendered: true });
    }

    let ChartJSX = null;
    let width = Math.round(this.svgDiv.getBoundingClientRect().width);
    const { maxWidth, minWidth } = this.state;

    if (width > maxWidth) {
      width = maxWidth;
    }
    if (width < minWidth) {
      width = minWidth;
    }

    const height = Math.round(width / 2);
    // refreshData is an async operation
    this.refreshData().then((hashTable) => {
      const keys = Object.keys(hashTable);
      const dataset = keys.map(key => hashTable[key]);
      const colorValues = keys.map(key => hashTable[key].color);
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
  
      switch (type) {
        case 'pie':
        case 'pie-donut':
          ChartJSX = (<PieChart {...props} />);
          break;
  
        case 'bar':
          ChartJSX = (<BarChart {...props} />);
          break;
  
        case 'hbar':
          ChartJSX = (<HBarChart {...props} />);
          break;
  
        case 'line':
        case 'line-scatter':
        case 'line-area':
          ChartJSX = (<LineChart {...props} />);
          break;
  
        default:
          console.warn('chart has not been rendered');
      }
    
      const callback = () => {
        this.setState({
          ChildChartJSX: ChartJSX,
          prevType: type, // type and comparisionField are for resize function
          prevComparisonField: comparisionField,
        });
      };
  
      if (this.state.prevType !== type || reMountForcefully) {
        this.setState({
          ChildChartJSX: null,
        }, callback);
      } else {
        callback();
      }
    });
  }
  determineSign(comparisionField) {
    if (!comparisionField) {
      return '';
    }

    if (
      comparisionField.indexOf('price') === -1
      && comparisionField.indexOf('24h_volume') === -1
      && comparisionField.indexOf('market_cap') === -1
    ) {
      return '%';
    }

    return this.props.currentSign;
  }
  drawCurrencySign(comparisionField, g, pos = { axis: 'y' }) {
    // pos object is used when currency sign should be positioned somewhere not in the left top corner
    const sign = this.determineSign(comparisionField);
    const yAxis = g.select('g.axis--' + pos.axis);
    
    if (!yAxis.select('g.currency-sign').node()) {
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
  recalc(axis, defaultMargin, callbacks, dir = 'left') {
    // longest value - pixelwise
    let dirVal = defaultMargin[dir];
    
    axis.selectAll('.tick')
      .each(val => {
        let finalVal = val;
        // if convertable to number -> cut digits after coma
        if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(val)) {
          finalVal = Number(val).toFixed(3);
        }
        // if not convertable -> it's a name - leave it as it is
        const pixelVal = this.WordLengthTester.getLengthOf(finalVal) + 10; // 10 is for padding
        if(dirVal < pixelVal) {
          dirVal = pixelVal;
        }
    });
    
    // in order not to mutate defaultMargin
    const margin = Object.assign({}, defaultMargin, { [dir]: dirVal });
    // call functions that will update properties dependant on the margin.left value
    callbacks.forEach(callback => {
      callback(margin);
    });
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
