// import React from 'react';
import * as d3 from 'd3';
// import { attrs } from 'd3-selection-multi';

import BasicLineChart from '../../../General/BasicLineChart';

import Graph from '../../../../components/Graph';
import { formProperDateFormat, formTickValues } from '../../../../helperFunctions';

// we use BasicLineChart component as a base
// for extending it with functionality needed for certain view(Bitcoin History Graph)
// instead of repeating the same methods over and over again
// Inheritance Inversion HOC pattern is used

function LineChartHOC(BaseComponent) {
  return class AugmentedLineChart extends BaseComponent {
    createScale(dataset, actualWidth, actualHeight) {
      this.makeScales(dataset, actualWidth, actualHeight);
      this.makeAxisesGen(dataset, actualHeight);
    }
    makeScales(dataset, width, height) {
      // dates are in chronological order
      const firstDate = dataset[0].time.getTime();
      const lastDate = dataset[dataset.length - 1].time.getTime();

      this.xScale = d3.scaleLinear()
        .domain([firstDate, lastDate])
        .range([0, width]);

      this.yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.currencyValue))
        .range([height, 0]);
    }
    makeAxisesGen(dataset, actualHeight) {
      const {
        yTickValues,
        xTickValues,
        xTicksFormat,
      } = this.determineTicks(dataset);

      const yAxisGen = d3.axisLeft(this.yScale)
        .tickValues(yTickValues);
      const xAxisGen = d3.axisBottom(this.xScale)
        .tickValues(xTickValues).tickFormat(d3.timeFormat(xTicksFormat));

      this.setState({
        yAxisGen,
        xAxisGen,
      }, () => {
        this.appendAxises(actualHeight);
        this.drawCurrencySign();
      });
    }
    drawCurrencySign() {
      const { g } = this.state;
      const yAxis = g.select('g.y-axis');

      if (!yAxis.select('g#currency-sign').node()) {
        yAxis
          .append('g')
          .attrs({
            id: 'currency-sign',
          })
          .append('text')
          .attrs({
            fill: '#000',
            'font-size': '18',
            x: '4',
            y: '-10',
          });
      }

      const text = g.select('#currency-sign text');

      text
        .transition()
        .duration(500)
        .attrs({
          y: '-100',
        });

      setTimeout(() => {
        text
          .html(this.props.signs[this.props.model.filters.currency])
          .transition()
          .duration(500)
          .attrs({
            y: '-10',
          });
      }, 500);
    }
    createHashTable(dataset, callback) {
      const hashTable = {};
      dataset.forEach((item) => {
        hashTable[Math.round(this.xScale(item.time.getTime()))] = {
          currencyValue: item.currencyValue,
          time: item.time,
        };
      });
      this.setState({
        hashTable,
      }, () => {
        if (callback) {
          callback(dataset);
        }
      });
    }
    addMovableParts(dataset) {
      const svg = d3.select(this.svg);
      const { g } = this.state;
      const { margin } = this.props.model;
      const lineFunction = d3.line()
        .x(0)
        .y(d => this.yScale(d.currencyValue));

      const hoverG = g.append('g');

      hoverG.append('path')
        .attrs({
          d: lineFunction(dataset),
          stroke: '#717A84',
          'stroke-width': 2,
          fill: 'none',
          id: 'movable',
          transform: 'translate(-100, 0)',
        });

      hoverG.append('circle')
        .attrs({
          r: 5,
          class: 'dot',
          fill: '#26B99A',
        })
        .style('opacity', 0);

      d3.select(this.svg.parentElement).append('div') // adding tooltip
        .attr('class', 'tooltip')
        .style('opacity', 0);

      svg.on('mousemove', () => {
        if (this.state.timeoutId) {
          clearTimeout(this.state.timeoutId);
        } // reset time

        const svgDOMRect = svg.node().getBoundingClientRect();
        const offsetLeft = svgDOMRect.left;
        const svgWidth = svgDOMRect.width;

        const { hashTable } = this.state;
        const xPos = Math.round(d3.event.clientX - offsetLeft - margin.left);

        if (
          xPos > (svgWidth - margin.right - margin.left) + 10 // 10 is for padding
          || xPos < 0
        ) {
          this.hideDotsAndTooltip();
          return;
        }

        let rightDist = xPos;
        let leftDist = xPos;
        let valueKey;

        // looks for closest point relative to the mouse
        while (!hashTable[String(leftDist)] && leftDist < (svgWidth + 10)) {
          leftDist += 1;
        }
        while (!hashTable[String(rightDist)] && rightDist > -10) {
          rightDist -= 1;
        }

        if (rightDist < leftDist) {
          valueKey = rightDist;
        } else {
          valueKey = leftDist;
        }

        const value = hashTable[String(valueKey)];
        if (value) {
          this.showDotsAndTooltip(Object.assign({}, value));
        } else {
          this.hideDotsAndTooltip();
        }

        g.select('#movable')
          .attrs({
            transform: `translate(${xPos}, 0)`,
          });

        this.setState({ timeoutId: setTimeout(() => this.hideDotsAndTooltip(), 3000) });
      });
    }
    showDotsAndTooltip({ time, currencyValue }) {
      // debugger;
      const { g } = this.state;

      g.selectAll('.dot')
        .attrs({
          cy: this.yScale(currencyValue),
          cx: this.xScale(time.getTime()),
        })
        .transition()
        .duration(100)
        .style('opacity', 0.9);

      const tooltip = d3.select(this.svg.parentElement).select('.tooltip');

      tooltip
        .transition()
        .duration(100)
        .style('opacity', 0.9);

      tooltip.html(`
        <h4>${formProperDateFormat(time.getFullYear(), time.getMonth() + 1, time.getDate())}</h4>
        <strong>Price: ${this.props.signs[this.props.model.filters.currency] + currencyValue.toFixed(2)}</strong>
      `);

      tooltip
        .style('left', `${this.xScale(time.getTime()) + (parseInt(getComputedStyle(tooltip.node()).width, 10) / 2)}px`)
        .style('top', `${this.yScale(currencyValue)}px`);
    }
    hideDotsAndTooltip() {
      const { g } = this.state;

      g.select('#movable')
        .attr('transform', 'translate(-999, 0)');

      g.selectAll('.dot')
        .transition()
        .duration(300)
        .style('opacity', 0);

      d3.select(this.svg.parentElement).select('.tooltip')
        .transition()
        .duration(300)
        .style('opacity', 0);
    }
    createGraphInstance(dataset) {
      const lineGraph = new Graph({
        type: 'bitcoin-rate',
        color: '#c9302c',
        hidden: false,
        lineFunction: d3.line()
          .x(d => this.xScale(d.time.getTime()))
          .y(d => this.yScale(d.currencyValue)),
        container: this.state.g,
      });
      lineGraph.append(dataset);
      this.setState({ lineGraph });
    }
    determineTicks(dataset) {
      const xTicksFormat = this.props.model.xTicksFormat[this.props.model.filters.timeline];
      const { ticksLevel } = this.props.model;

      // outputs an array of evenly distributed values between prevSm and prevLg
      const yTickValues = formTickValues({
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
        xTicksFormat,
      };
    }
    buildCallback(dataset, actualWidth, actualHeight) {
      this.createScale(dataset, actualWidth, actualHeight);

      this.createGraphInstance(dataset);

      this.createHashTable(dataset, this.addMovableParts.bind(this));
    }
    updateCallback(dataset, actualWidth, actualHeight) {
      this.createScale(dataset, actualWidth, actualHeight);

      // updates already existing graph based on
      this.state.lineGraph.update(dataset);

      this.createHashTable(dataset);
    }
    render() {
      return super.render();
    }
  };
}

export default LineChartHOC(BasicLineChart);
