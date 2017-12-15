import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
// import { attrs } from 'd3-selection-multi';

import Message from './Message';

export default class BasicLineChart extends React.Component {
  constructor() {
    super();
    this.state = {
      isMessageVisible: false,
    };
  }
  componentDidMount() {
    this.showMessage();
  }
  hideMessage() {
    this.setState({
      isMessageVisible: false,
    });
  }
  showMessage() {
    this.setState({
      isMessageVisible: true,
    });
  }
  buildLine(dataset) {
    if (!this.props.hasErrorOccured) {
      this.hideMessage();
    }

    if (!dataset || Object.prototype.toString.call(dataset) !== '[object Array]') {
      return;
    }

    const width = 500;
    const height = 300;
    // let width = Math.round(this.svg.parentElement.getBoundingClientRect().width);
    // if (width > 600) {
    //   width = 600;
    // } else if (width < 500) {
    //   width = 500;
    // }

    const { margin } = this.props.model;
    // const height = width * 0.6;
    const actualWidth = width - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;

    const svg = d3.select(this.svg);
    svg.attrs({
      width,
      height,
      id: this.props.graphId,
    });

    this.setState({
      width,
      height,
      g: svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`),
    }, () => {
      this.buildCallback(
        dataset,
        actualWidth,
        actualHeight,
      );
    });
  }
  updateLine(dataset) {
    if (!this.props.hasErrorOccured) {
      this.hideMessage();
    }    
    // because we expect an array
    if (!dataset || Object.prototype.toString.call(dataset) !== '[object Array]') {
      return;
    }

    const { margin } = this.props.model;
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

    const { g } = this.state;
    const duration = 300;

    // Y AXIS
    let yAxis = g.select('g.y-axis');
    if (!yAxis.node()) {
      yAxis = g.append('g').attr('class', 'y-axis');
    }
    yAxis
      .transition()
      .duration(duration)
      .call(yAxisGen);

    // X AXIS
    let xAxis = g.select('g.x-axis');
    if (!xAxis.node()) {
      xAxis = g.append('g')
        .attrs({
          transform: `translate(0, ${actualHeight})`,
          class: 'x-axis',
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
        <svg ref={(svg) => { this.svg = svg; }} />
        <Message
          color={this.props.hasErrorOccured ? '#c9302c' : '#2A3F54' }
          msg={this.props.hasErrorOccured ? 'Error has occurred' : 'Wait, please'}
          isMessageVisible={this.state.isMessageVisible}
        />
      </div>
    );
  }
}

BasicLineChart.propTypes = {
  model: PropTypes.object,
  graphId: PropTypes.string,
};
