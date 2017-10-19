import React from "react";
import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import WaitMessage from "../../../General/WaitMessage.js";

import Graph from "../../../../components/Graph.js";

import { formTickValues } from "../../../../helperFunctions.js";

export default class LineCharts extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {
        this.hidePreloader();
    }
    buildLines(dataset) {
        const margin = this.props.model.margin;
        const width = this.props.model.width - margin.left - margin.right;
        const height = this.props.model.width * 0.6 - margin.top - margin.bottom;

        this.setState({
            svg: d3.select(this.container).append("svg")
                        .attrs({
                            width: width + margin.left + margin.right,
                            height: height + margin.top + margin.bottom,
                            id: "ask-bid-spread"
                        })
        }, () => {
            this.setState(prevState => ({
                graphG: prevState.svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)
            }));
        });
        
        this.makeScales(dataset, width, height);
        //INSTANTIATE GRAPH OBJECTS
        this.createGraphInstances(dataset);
        // add axises
        // ONLY ONE PAIR OF AXISES
        const yTicks = formTickValues({
            finalLevel: 3,
            level: 1,
            prevLg: d3.max(dataset, d => +d.ticker.ask > +d.ticker.bid ? +d.ticker.ask : +d.ticker.bid),
            prevSm: d3.min(dataset, d => +d.ticker.ask < +d.ticker.bid ? +d.ticker.ask : +d.ticker.bid),
        });
        const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks);
        const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%H:%M"));
    
        const yAxis = this.state.graphG
                        .append("g")
                        .call(yAxisGen)
                        .attrs({
                            "class": "y-axis"
                        });
        const xAxis = this.state.graphG
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

        const margin = this.props.model.margin;        
        //const paddingVal = parseInt(this.state.graphSVG.style("padding-left"));
        const width = this.state.svg.attr("width") - margin.left - margin.right;
        const height = this.state.svg.attr("height") - margin.top - margin.bottom;    

        // dataset has changed, need to update #historical-data graph
        // data is in chronological order
        this.makeScales(dataset, width, height);
        // update basic graph
        
        for(let key in this.state.graphs) {
            this.state.graphs[key].update(dataset);
        }

        // update axises
        const yTicks = formTickValues({
            finalLevel: 3,
            level: 1,
            prevLg: d3.max(dataset, d => +d.ticker.ask > +d.ticker.bid ? +d.ticker.ask : +d.ticker.bid),
            prevSm: d3.min(dataset, d => +d.ticker.ask < +d.ticker.bid ? +d.ticker.ask : +d.ticker.bid),
        });
        const yAxisGen = d3.axisLeft(this.yScale).tickValues(yTicks)
        const xAxisGen = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%H:%M"));
    
        const yAxis = this.state.graphG
                        .select("g.y-axis")
                        .transition()
                        .duration(1000)
                        .call(yAxisGen);
                        
        const xAxis = this.state.graphG
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
              
        
        const spread = !!this.state.graphs ? this.state.graphs["spread"] : null;

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
        container: this.state.graphG
        });
        ask.append(dataset);        
    
        const bid = new Graph({
        type: "bid",
        color: "#c9302c",
        hidden: false,
        lineFunction: d3.line()
                        .x(d => this.xScale(new Date(d.created_on).getTime()))
                        .y(d => this.yScale(+d.ticker.bid)),
        container: this.state.graphG
        });
        bid.append(dataset,);
    
        const spread = new Graph({
        type: "spread",
        color: "#26B99A",
        hidden: true,
        lineFunction: d3.line()
                        .x(d => this.xScale(new Date(d.created_on).getTime()))
                        .y(d => this.yScale((+d.ticker.ask) - (+d.ticker.bid))),
        container: this.state.graphG
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
        
        const toggledGraph = this.state.graphs[id];
        toggledGraph.hidden = active;
        // remake scales to fit/unfit the spread graph
        if(id === "spread") this.updateLines(this.props.model.data);
    }
    showPreloader() {
        this.WaitMessage.show();
    }
    hidePreloader() {
        this.WaitMessage.hide();
    }
    render() {
        return (
            <div ref={div => this.container = div} className="graph">
                <WaitMessage ref={waitMessage => this.WaitMessage = waitMessage} msg="Wait, please"/>
            </div>
        );
    }
};