import React from "react";
import * as d3 from "d3";
import {attrs} from "d3-selection-multi";

import {twoArraysAreEqual} from "../../../../../../../helperFunctions.js";

export default class HBarChart extends React.Component {
    constructor() {
        super();
        this.state = {
            duration: 300,
            margin: { top: 30, right: 10, bottom: 30, left: 70 }
        };
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
        const margin = this.state.margin;
        const fixedWidth = this.props.width - (margin.left + margin.right);
        const fixedHeight = this.props.height - (margin.top + margin.bottom);
        const svg = d3.select(this.svg);        

        this.setState({fixedHeight}); // will need this variable later on
  
        svg.attr("width", this.props.width)
            .attr("height", this.props.height)

        this.yScale = d3.scaleBand()
            .range([fixedHeight, 0])
            .padding(0.1);

        this.xScale = d3.scaleLinear()
            .range([0, fixedWidth]);

        this.setState({
            g: svg.append("g")
                .attrs({
                    "transform": `translate(${margin.left}, ${margin.top})`,
                    "class": "hbar"
                })
            }, () => {
                this.state.g.append("g")
                    .attr("class", "axis axis--y");
                
                this.state.g.append("g")
                    .attr("class", "axis axis--x");

                this.updateSVG();
            });
    }
    updateSVG() {
        const {dataset, comparisionField, type} = this.props;
        const g = this.state.g;
        const {fixedWidth, fixedHeight, duration} = this.state;        

        let [min, max] = d3.extent(dataset, d => +d[comparisionField]);       

        this.yScale.domain(dataset.map(d => d.id));
        this.xScale.domain([min, max]);
        
        // ADD Y AXIS
        const inRange = val => {
            if(val < 0) {
                return 0;
            }
            if(val > fixedWidth) {
                return fixedWidth;                
            }
            return val;
        }

        const yAxis = g.select(".axis--y");
        
        yAxis.transition()
            .duration(duration)
            .attr("transform", `translate(${inRange(this.xScale(0))}, 0)`) //  > 0 ? this.xScale(0) : 0 
            .call(d3.axisLeft(this.yScale).tickValues(dataset.map(d => d.id)));

        yAxis.selectAll(".tick")
            .data(dataset)
            .select("text")
            .transition()
            .duration(duration)
            .attr("x", d => +d[comparisionField] < 0 ? 10 : -10)
            .style("font-size", "14px")
            .style("text-anchor", d => {
                console.log(+d[comparisionField])
                return +d[comparisionField] < 0 ? "start" : "end";
            });

        // ADD X AXIS
        g.select(".axis--x")
            .attr("transform", `translate(0, ${fixedHeight})`)
            .transition()
            .duration(duration)
            .call(d3.axisBottom(this.xScale).ticks(5));

       
        // APPEND RECTANGLES
        const rects = g.selectAll("rect")
            .data(dataset);

        rects.exit()
            .remove();

        rects.enter()
            .append("rect")
            .merge(rects)
                .on("mouseover", d => this.toggleBar(d3.event.target, d, false))
                .on("mouseout", d => this.toggleBar(d3.event.target, d, true))
                .transition()
                .duration(duration)
                .attrs({
                    "fill":  d => this.props.color(+d[comparisionField]),
                    "data-currency-id": d => d.id, // ???
                    "height": () => this.yScale.bandwidth(),
                    "y": d => this.yScale(d.id),
                    "width": d => Math.abs(this.xScale(+d[comparisionField]) - this.xScale(0)),
                    "x": d => {
                        let val = 0;
                        if(min > 0) {
                            val = min;
                        }
                        if(max < 0) {
                            val = max;
                        }
                        return this.xScale(Math.min(val, +d[comparisionField]))
                    }
                });

        console.log(yAxis.selectAll(".tick").style("font-size"));
    }
    toggleBar(el, d, mouseOut) {
        // show the exact value
    }
    render() {
        return (
              <svg ref={svg => this.svg = svg}></svg>
        );
    }
}