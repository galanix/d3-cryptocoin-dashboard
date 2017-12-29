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
      width: 500,
      height: 300,
    };
    this.onResize = this.onResize.bind(this);
  }
  onResize() {
    if (this.state.isMessageVisible) {
      // width of a message container depends on parent
      // when page is resized
      // parent's width may change
      // but message's width won't, so
      // the scroll can appear
      // to prevent that we resize message
      // by calling showMessge again
      setTimeout(() => this.showMessage(), 301);
      // at some breakpoints width of parent container will change due to relayout
      // so we will need to recalc with twice
      // to prevent that we will wait until the transition animation(.3s) is done
      // and only than recalc
    }
  }
  componentDidMount() {
    this.showMessage();
    window.addEventListener('resize', this.onResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }
  hideMessage() {
    // graph is ready to be drawn,
    // make more space for it
    // by going to the default
    // this will add scroll, if not enough space

    this.svg.parentElement.style.width = this.state.width;

    this.setState({
      isMessageVisible: false,
    });
  }
  showMessage() {
    // graph is not yet ready to be drawn
    // but the scroll will already be present at this time
    // make container smaller to hide scroll
    // until graph is not drawn
    // - 10 is there to make the scrollbar disappear;

    // const svgWrapper = this.svg.parentElement;
    // const widthVal = parseFloat(getComputedStyle(svgWrapper.parentElement).width) - 10;
    // svgWrapper.style.width = `${widthVal}px`;

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

    const { width, height } = this.state;
    const { margin } = this.props.model;
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
        <svg width="0" height="0" ref={(svg) => { this.svg = svg; }} />
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
