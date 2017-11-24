import React from 'react';
import * as d3 from 'd3';
import { attrs } from 'd3-selection-multi';

import Message from '../../../General/Message.js';

import Graph from '../../../../components/Graph.js';

import { formTickValues } from '../../../../helperFunctions.js';

export default class LineChartGroup extends React.Component {
  componentDidMount() {
    this.hidePreloader();
  }
  buildLines(dataset) {
    let width = Math.round(this.container.getBoundingClientRect().width);
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
      id: 'ask-bid-spread',
    });

    this.setState({
      width,
      height,
      g: svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
    }, () => {
      // INSTANTIATE GRAPH OBJECTS
      // AND WHEN DONE, CALLBACK TO CREATE SCALES AND APPEND AXISES
      this.createGraphInstances(dataset, () => {
        this.makeScales(dataset, actualWidth, actualHeight);
        this.appendAxises(dataset, actualHeight);
        // add graphs after scales are defined
        const graphs = this.state.graphs;
        Object.keys(graphs).forEach(type => graphs[type].append(dataset));
      });
    });
  }
  updateLines(dataset) {    
    if(!dataset) {
      return;
    }

    const margin = this.props.model.margin;
    const { width, height } = this.state;
    const actualWidth = width - margin.left - margin.right;
    const actualHeight = height - margin.top - margin.bottom;
    
    this.makeScales(dataset, actualWidth, actualHeight);
    // update basic graph
    
    const graphs = this.state.graphs;
    Object.keys(graphs).map(key => {
      graphs[key].update(dataset);
    });

    this.appendAxises(dataset, actualHeight);
  }
  showPreloader() {
    this.message.show();
  }
  hidePreloader() {
    this.message.hide();
  }
  appendAxises(dataset, actualHeight) {
    const { 
      xTicksFormat,
      yTickValues,
     } = this.determineTicks(dataset);

    const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTickValues);
    const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat(xTicksFormat));        

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
      .call(xAxisGen);
  }
  determineTicks(dataset) {
    const xTicksFormat = '%H:%M';
    const yTickValues = formTickValues({
      finalLevel: 3,
      level: 1,
      prevLg: d3.max(dataset, d => Number(d.ticker.ask) > Number(d.ticker.bid) ? Number(d.ticker.ask) : Number(d.ticker.bid)),
      prevSm: d3.min(dataset, d => {
        if(this.state.graphs.spread.hidden) {
          const ask = Number(d.ticker.ask);
          const bid = Number(d.ticker.bid);

          if(ask < bid) {
            return ask;
          }
          return bid;
        }
        return Math.abs((Number(d.ticker.ask)) - (Number(d.ticker.bid)))
      }),
    });

    return {
      xTicksFormat,
      yTickValues,
    };
  }
  makeScales(dataset, width, height) {
    const firstDate = new Date(dataset[0].created_on).getTime();
    const lastDate = new Date(dataset[dataset.length - 1].created_on).getTime();

    let spread;
    let ask;
    let bid;
    let minValY;
    let maxValY;

    // if graphs are already instantiated
    const graphs = this.state.graphs;
    if(!!graphs) {      
      spread = graphs['spread'];
      ask = graphs['ask'];
      bid = graphs['bid'];
    }

    if(spread.hidden) {
      minValY = d => Math.min(Number(d.ticker.ask), Number(d.ticker.bid));      
    } else {
      minValY = d => Math.abs(Number(d.ticker.ask) - Number(d.ticker.bid));
    }

    if(ask.hidden && bid.hidden) {
      maxValY = d => Math.abs(Number(d.ticker.ask) - Number(d.ticker.bid));
    } else {
      maxValY = d => Math.max(Number(d.ticker.ask), Number(d.ticker.bid));
    }

    this.yScale = d3.scaleLinear()
      .domain([
        d3.min(dataset, d => minValY(d)),
        d3.max(dataset, d => maxValY(d))
      ])
      .range([height, 0]);
    
    this.xScale = d3.scaleLinear()
      .domain([
        firstDate,
        lastDate
      ])
      .range([0, width]);
  }
  createGraphInstances(dataset, callback) {
    const g = this.state.g;
    
    const ask = new Graph({
      type: 'ask',
      color: '#31b0d5',
      hidden: false,
      lineFunction:  d3.line()
        .x(d => this.xScale(new Date(d.created_on).getTime()))
        .y(d => this.yScale(Number(d.ticker.ask))),
      container: g,
    });

    const bid = new Graph({
      type: 'bid',
      color: '#c9302c',
      hidden: false,
      lineFunction: d3.line()
        .x(d => this.xScale(new Date(d.created_on).getTime()))
        .y(d => this.yScale(Number(d.ticker.bid))),
      container: g,
    });

    const spread = new Graph({
      type: 'spread',
      color: '#26B99A',
      hidden: true,
      lineFunction: d3.line()
        .x(d => this.xScale(new Date(d.created_on).getTime()))
        .y(d => this.yScale((Number(d.ticker.ask)) - (Number(d.ticker.bid)))),
      container: g,
    });

    this.setState({
      graphs: {
        ask, bid, spread,
      }
    }, callback);  
  }
  toggleGraphs(id, active) {
    const svg = d3.select(this.svg);
    const graphs = this.state.graphs;

    svg
      .select('#graph-type--' + id)
      .transition()
      .duration(600)
      .style('opacity', active ? 0 : 1);
    
    // Toggled graph
    graphs[id].hidden = active;
    
    /*
      we want to update graphs always except for the 2 cases:
        1. all graphs are hidden
        2. when ask graph is hidden but bid isn't and vice versa - because in this case ask/bid only changes opacity,
           scale doesn't need to be decalculated
    */
    console.log('here');
    // #REDO - if statement doesn't yield true
    if(
      !(
        graphs['ask'].hidden
        && graphs['bid'].hidden
        && graphs['spread'].hidden)
      && !(
        (!graphs['ask'].hidden || graphs['bid'].hidden)
        || (graphs['ask'].hidden || !graphs['bid'].hidden)
      )
    ) {
      // remake scales to fit/unfit the graphs
      console.log('not here');
      this.updateLines(this.props.model.data);
    }
  }
  render() {
    return (
      <div ref={div => this.container = div} className="graph">
        <svg ref={svg => this.svg = svg}></svg>
        <Message ref={message => this.message = message} msg="Wait, please"/>
      </div>
    );
  }
};