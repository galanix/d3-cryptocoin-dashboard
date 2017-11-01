import React from "react";
import * as d3 from "d3";
import {attrs} from "d3-selection-multi";

import {twoArraysAreEqual} from "../../../../../../../helperFunctions.js";

export default class HBarChart extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    componentDidMount() {
        this.renderSVG();      
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.type !== this.props.type) {
            d3.select(this.svg.parentElement).remove();        
        }      
    }
    shouldComponentUpdate(nextProps) {
         return !(
            twoArraysAreEqual(nextProps.dataset, this.props.dataset) &&
            nextProps.comparisionField === this.props.comparisionField &&
            nextProps.type === this.props.type &&
            nextProps.width === this.props.width  // width can not change without changing height
        );
    }
    componentDidUpdate() {
        this.updateSVG();
    }
    renderSVG() {
        const margin = { top: 30, right: 100, bottom: 30, left: 100 };
        const fixedWidth = this.props.width - (margin.left + margin.right);
        const fixedHeight = this.props.height - (margin.top + margin.bottom);
        this.setState({fixedHeight}); // will need this variable later on
        const svg = d3.select(this.svg);
  
        svg.attr("width", this.props.width)
            .attr("height", this.props.height)

        this.yScale = d3.scalePoint()
            .range([0, fixedHeight])
            .padding(0.2);

        this.xScale = d3.scaleLinear()
            .range([0, fixedWidth])
            .nice();

        this.setState({
            g: svg.append("g")
                .attrs({
                    "transform": `translate(${margin.left}, ${margin.top})`,
                    "class": "hbar"
                })
            }, () => {
                this.state.g.append("g")
                    .attr("class", "axis axis--y");
                
                this.updateSVG();
            });        
    }
    updateSVG() {
        const {dataset, comparisionField, type} = this.props;
        const g = this.state.g;
        let [min, max] = d3.extent(dataset, d => +d[comparisionField]);
        min = Math.min(min, 0);
        max = Math.max(max, 0);

        this.yScale.domain(dataset.map(d => d.id));
        this.xScale.domain([min, max]);

        // ADD LABELS WITH CURRENCY NAMES
        this.state.g.select(".axis--y")
            .transition()
            .duration(300)
            .call(d3.axisLeft(this.yScale).tickValues(dataset.map(d => d.id)));        
       
        // APPEND RECTANGLES
        const rects = g.selectAll("rect")
            .data(dataset);

        rects.exit()
            .remove();

        let bandwidth =  (this.state.fixedHeight / dataset.length);
            bandwidth *= 0.9;

        rects.enter()
            .append("rect")
            .merge(rects)
                .on("mouseover", d => this.toggleBar(d3.event.target.getAttribute("data-currency-id"), d, false))
                .on("mouseout", d => this.toggleBar(d3.event.target.getAttribute("data-currency-id"), d, true))
                .transition()
                .duration(300)
                .attrs({
                    "fill":  d => this.props.color(+d[comparisionField]),
                    "data-currency-id": d => d.id,
                    "height": () => bandwidth > 200 ? 200 : bandwidth,
                    "y": d => this.yScale(d.id) - bandwidth / 2,
                    "width": d => Math.abs(this.xScale(+d[comparisionField]) - (this.xScale(0))),
                    "x": this.xScale(min),
                });

        // APPEND CURRENCY VALUES TO THE RIGHT
        const text = g.selectAll(".value")
            .data(dataset);
        
        text.exit().remove();

        text.enter()
            .append("text")
            .merge(text)
                .attr("class", "value")
                .attr("y", d => this.yScale(d.id) + 7) // font === 14px, 14 / 2 === 7
                .attr("x", d => Math.abs(this.xScale(+d[comparisionField]) - (this.xScale(0))) + 5)
                .style("font-size", "14px")
                .text(d => d[comparisionField]);
    }
    toggleBar() {
        // darken the rect?       
    }
    render() {
        return (            
              <svg ref={svg => this.svg = svg}></svg>            
        );
    }
}