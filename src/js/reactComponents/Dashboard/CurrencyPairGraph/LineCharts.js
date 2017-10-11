import React from "react";
import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import Graph from "../../../components/Graph";

export default class LineCharts extends React.Component {
    constructor() {
        super();
    }
    buildLines(dataset) {
        const { width, paddingVal } = this.props.model;
        const height = Math.round(0.6 * width);

        this.setState({
            graphSVG: d3.select(this.container).append("svg")
        }, () => {
            this.state.graphSVG
            .attrs({
              width,
              height,
              id: "ask-bid-spread",
            })
            .style("padding", paddingVal);      
        });
        
        this.makeScales(dataset, width, height);
        //INSTANTIATE GRAPH OBJECTS
        this.createGraphInstances(dataset);
        // add axises
        // ONLY ONE PAIR OF AXISES
        const yAxisGen = d3.axisLeft(this.yScale);
        const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%H:%M"));
    
        const yAxis = this.state.graphSVG
                        .append("g")
                        .call(yAxisGen)
                        .attrs({
                            "class": "y-axis"
                        });
        const xAxis = this.state.graphSVG
                        .append("g")
                        .call(xAxisGen)
                        .attrs({
                            "transform": `translate(0, ${height})`,
                            "class": "x-axis"
                        });
    }
    updateLines(dataset) {
        if(!dataset) {
          return;
        }
        
        const paddingVal = parseInt(this.state.graphSVG.style("padding-left"));
        const width = Math.round(this.state.graphSVG.node().getBoundingClientRect().width) - paddingVal * 2;    
        const height = Math.round(width * 0.6);

        this.state.graphSVG.attrs({
          width,
          height
        });

        // dataset has changed, need to update #historical-data graph
        // data is in chronological order
        this.makeScales(dataset, width, height);
        // update basic graph
        
        for(let key in this.state.graphs) this.state.graphs[key].update(dataset);        

        // update axises
        const yAxisGen = d3.axisLeft(this.yScale);
        const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%H:%M"));
    
        const yAxis = this.state.graphSVG
                        .select("g.y-axis")
                        .transition()
                        .duration(1000)
                        .call(yAxisGen);
                        
        const xAxis = this.state.graphSVG
                        .select("g.x-axis")
                        .transition()
                        .duration(1000)
                        .attr("transform", `translate(0, ${height})`)
                        .call(xAxisGen);
    }
    makeScales(dataset, width, height) {
        const firstDate = new Date(dataset[0].created_on).getTime();
        const lastDate = new Date(dataset[dataset.length - 1].created_on).getTime();
    
        this.xScale = d3.scaleLinear()
          .domain([
            firstDate,
            lastDate
          ])
          .range([0, width]);
              
        
        const spread = !!this.state.graphInstances ? this.state.graphInstances["spread"] : null;
            
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
    }
    createGraphInstances(dataset) {
        const ask = new Graph({
        type: "ask",
        color: "#31b0d5",
        hidden: false,
        lineFunction:  d3.line()
                         .x(d => this.xScale(new Date(d.created_on).getTime()))
                         .y(d => this.yScale(+d.ticker.ask)),
        container: this.state.graphSVG
        });
        ask.append(dataset);        
    
        const bid = new Graph({
        type: "bid",
        color: "#c9302c",
        hidden: false,
        lineFunction: d3.line()
                        .x(d => this.xScale(new Date(d.created_on).getTime()))
                        .y(d => this.yScale(+d.ticker.bid)),
        container: this.state.graphSVG
        });
        bid.append(dataset,);
    
        const spread = new Graph({
        type: "spread",
        color: "#26B99A",
        hidden: true,
        lineFunction: d3.line()
                        .x(d => this.xScale(new Date(d.created_on).getTime()))
                        .y(d => this.yScale((+d.ticker.ask) - (+d.ticker.bid))),
        container: this.state.graphSVG
        });
        spread.append(dataset);        

        this.setState({
            graphs: { ask, bid, spread }
        })
    }
    toggleGraphs(id, active) {
        d3.select("#graph-type--" + id)
        .transition()
        .duration(600)
        .style("opacity", active ? 0 : 1);
        
        const graphInstance = this.state.graphs[id];
        graphInstance.hidden = active;
    }
    render() {
        return (
            <div ref={div => this.container = div} 
                 className="graph col-md-12 col-sm-12 col-xs-12">
            </div>
        );
    }
};