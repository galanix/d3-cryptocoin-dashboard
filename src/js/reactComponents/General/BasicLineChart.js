import React from 'react';

import Message from './Message';

import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';

export default class BasicLineChart extends React.Component {
  constructor() {
    super();
    this.state = {
      isMessageVisible: false,
    };
  }
  hideMessage() {
    this.setState({
      isMessageVisible: false
    });
  }
  showMessage() {
    this.setState({
      isMessageVisible: true,
    });
  }
  buildLine(dataset) {
    if(!dataset || Object.prototype.toString.call(dataset) !== '[object Array]') {
      return;
    }

    let width = Math.round(this.svg.parentElement.getBoundingClientRect().width);
    if(width > 600) {
      width = 600;
    } else if(width < 500) {
      width = 500;
    }

    const margin = this.props.model.margin;
    const height = width * 0.6;
    const actualWidth = width - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;

    const svg = d3.select(this.svg)
    svg.attrs({
      width,
      height,
      id: this.props.graphId
    });

    this.setState({
      width,
      height,
      g: svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
    }, () => {
      this.buildCallback(
        dataset, 
        actualWidth,
        actualHeight,
      );
    });
  }
  updateLine(dataset) {
    // because we expect an array
    if(!dataset || Object.prototype.toString.call(dataset) !== '[object Array]') {
      return;
    }

    const margin = this.props.model.margin;
    const { width, height } = this.state;
    const actualWidth = width - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;
    
    this.updateCallback(
      dataset,
      actualWidth,
      actualHeight,
    );
  }
  appendAxises(actualHeight) {
    const {
      yAxisGen,
      xAxisGen,
    } = this.state;

    const g = this.state.g;
    const duration = 300;

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
      .call(xAxisGen);
  }
  render() {
    return (
      <div className="graph">
        <svg ref={svg => this.svg = svg}></svg>
        <Message msg="Wait, please" isMessageVisible={this.state.isMessageVisible} />
    </div>
    );
  }
}