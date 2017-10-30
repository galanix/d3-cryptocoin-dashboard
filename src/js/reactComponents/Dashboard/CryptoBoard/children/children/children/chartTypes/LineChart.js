import React from "react";
import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import WaitMessage from "../../../../../../General/WaitMessage.js";
import Legend from "../Legend.js";

import Graph from "../../../../../../../components/Graph.js";

import { formTickValues, twoArraysAreEqual } from "../../../../../../../helperFunctions.js";

export default class LineChart extends React.Component {
    constructor() {
        super();
        this.state = {
            duration: 300
        };
    }
    componentDidMount() {
        this.hidePreloader();
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
        nextProps.width === this.props.width  // height depends on width
      );
    }
    componentDidUpdate() {
        this.updateSVG();
    }
    renderSVG() {
        const margin = { top: 30, right: 10, bottom: 50, left: 80 };
        const fixedWidth = this.props.width - (margin.left + margin.right);
        const fixedHeight = this.props.height - (margin.top + margin.bottom);
        this.setState({ fixedHeight });
        const svg = d3.select(this.svg);    

        svg.attr("width", this.props.width);
        svg.attr("height", this.props.height);

        this.xScale = d3.scalePoint()
            .range([0, fixedWidth])
            .padding(0.1)

        this.yScale = d3.scaleLinear()
            .range([fixedHeight, 0]);            

        this.setState({
            g: svg.append("g")
        }, () => {
            this.state.g.attr("transform", `translate(${margin.left}, ${margin.top})`);

            this.state.g.append("g")
                .attrs({
                    "class": "axis--y"
                });

            this.state.g.append("g")
                .attrs({
                    "transform": `translate(0, ${fixedHeight})`,
                    "class": "axis--x"
                });

            this.updateSVG();
        });       
    }
    updateSVG() {
        const comparisionField = this.props.comparisionField;
        const dataset = this.props.dataset;
        const ids = dataset.map(d => d.id);
        const [min, max] = d3.extent(dataset, d => +d[comparisionField]); 
        const type = this.props.type;
        //const yTicks = this.props.dataset.map(item => +item[comparisionField]);
        const yTicks = formTickValues({
            finalLevel: 3,
            level: 1,
            prevLg: max,
            prevSm: min
        });
        
        this.yScale.domain([min, max]);
        this.xScale.domain(ids);

        this.state.g.select("g.axis--x")
            .transition()
            .duration(300)
            .call(d3.axisBottom(this.xScale).tickValues(ids));

        this.state.g.selectAll(".axis--x text")
            .style("font-size", () => {
                const length = dataset.length;
                if(length > 12) {
                    return "10px";
                } else if(length > 7) {
                    return "14px";
                } else {
                    return "18px";
                }
            })
            .style("stroke", "#73879C")
            .style("cursor", "pointer")           
            .on("mouseover", d => this.handleHoverEvtHandler(d, false))
            .on("mouseout", d => this.handleHoverEvtHandler(d, true));

        this.state.g.select("g.axis--y")
            .transition()
            .duration(300)
            .call(d3.axisLeft(this.yScale).tickValues(yTicks));

        if(type === "line") {
            // BUILD LINE CHART
            this.buildLine();
        } else if(type === "line-scatter") {            
            this.buildScatterPlot();
        } else if(type === "line-area") {
            // BUILD AREA PLOT
            /*               
                TODO
            */
            this.buildAreaPlot();
        }

        this.drawCurrencySign();
        //this.legend.build();
    }
    buildLine(customStrokeWidth) {

        if(!this.state.line) {
            this.setState({
                line: new Graph({
                        type: this.props.type,
                        color: "#169F85",
                        hidden: false,
                        strokeWidth: !!customStrokeWidth ? customStrokeWidth : 2,
                        lineFunction:  d3.line()
                                         .x(d => this.xScale(d.id))
                                         .y(d => this.yScale(+d[this.props.comparisionField])),
                        container: this.state.g
                    })
            }, () => {
                this.state.line.append(this.props.dataset);
            });
        } else {
            // update comparisonField value to prevent getting old value from closure
            this.state.line.lineFunction.y(d => this.yScale(+d[this.props.comparisionField]));
            this.state.line.update(this.props.dataset);
        }
    }
    buildScatterPlot() {
        const { dataset, comparisionField } = this.props;

        let scatterPlot = this.state.g.select(".scatter-plot");
        if(!scatterPlot.node()) {
            scatterPlot = this.state.g.append("g")
                .attr("class", "scatter-plot");
        }

        const dots = scatterPlot.selectAll("circle")
            .data(dataset);

        dots
            .transition()
            .duration(this.state.duration)
            .attr("cx", d => this.xScale(d.id))
            .attr("cy", d => this.yScale(d[comparisionField]))
        
        dots.enter()
            .append("circle")
            .attr("r", 6)
            .attr("cx", d => this.xScale(d.id))
            .attr("cy", d => this.yScale(d[comparisionField]))
            .style("stroke", "#169F85")
            .style("fill", "#169F85")
            .style("stroke-width", 2)
            .style("cursor", "pointer")
            .merge(dots)
            .on("mouseover", (d, _i, el) => {
                this.handleHoverEvtHandler(d.id, false);
            })
            .on("mouseout", (d, _i, el) => {
                this.handleHoverEvtHandler(d.id, true)
            });

        dots.exit().remove();            
    }
    buildAreaPlot() {
        this.buildLine(3.5);

        if(!this.state.area) {
            this.setState({
                area: new Graph({
                        type: "area",
                        color: "#169F85",
                        hidden: false,
                        lineFunction: d3.area()
                                        .x(d => this.xScale(d.id))
                                        .y0(this.state.fixedHeight)
                                        .y1(d => this.yScale(d[this.props.comparisionField])),
                        container: this.state.g
                    })
            }, () => {
                this.state.area.append(this.props.dataset);

                this.state.g.select("#graph-type--area")
                    .style("opacity", 0.5)
                    .style("fill", "#169F85");                
            });
        } else {
            // update comparisonField value to prevent getting old value from closure
            this.state.area.lineFunction.y1(d => this.yScale(+d[this.props.comparisionField]));
            this.state.area.update(this.props.dataset);

            setTimeout(() => {
                this.state.g.select("#graph-type--area")                                
                    .transition()
                    .duration(100)
                    .style("opacity", 0.5)
            }, 1200);
        }

        // let areaPath = this.state.g.select("path.area")
        // if(!areaPath.node()) {
        //     areaPath = this.state.g.append("path")
        //         .attr("class", "area")
        //         .style("fill", "169F85")
        //         .style("opacity", 0.5)
        // }
        
        // areaPath.datum(this.props.dataset)            
        //     .transition()
        //     .duration(1200)
        //     .attr("d", this.area);
    }
    showPreloader() {
        this.WaitMessage.show();
    }
    hidePreloader() {
        this.WaitMessage.hide();
    }
    drawCurrencySign() {
        let sign = this.props.currentSign;
        const comparisionField = this.props.comparisionField;

        if(
            comparisionField.indexOf("price") === -1 &&
            comparisionField.indexOf("volume_24h") === -1 &&
            comparisionField.indexOf("market_cap") === -1
        ) {
            sign = "%";
        }

        const yAxis = this.state.g.select("g.axis--y");
        
        if(!yAxis.select("g.currency-sign").node()) {
            yAxis.append("g")
                .attrs({
                    "class": "currency-sign",
                })
                .append("text")
                .attrs({
                    "fill": "#000",
                    "font-size": "18",
                    "x": "4",
                    "y": "-10"
                });
        }
        const text = this.state.g.select(".currency-sign text");

        text            
            .transition()
            .duration(500)
            .attrs({
                y: "-100"
            });        

        setTimeout(() => {
            text         
                .html(sign)    
                .transition()
                .duration(500)
                .attrs({
                    y: "-10"
                });            
        }, 500);
    }
    handleHoverEvtHandler(id, mouseOut) {
        const d = this.props.dataset.find(item => item.id === id);

        // mw - modal window
        if(mouseOut) {
            this.state.g.selectAll(".tooltip--mw").transition().duration(100).style("opacity", 0).remove();
        } else {
            const tooltip = this.state.g.append("g").attr("class", "tooltip--mw");
            
            tooltip.append("text")
                .datum(d)                
                .attr("stroke", "#364B5F")
                .attr("x", d => this.xScale(d.id))
                .attr("y", d => this.yScale(+d[this.props.comparisionField]) - 15)
                .attr("text-anchor", "middle")
                .html(d => this.props.currentSign + d[this.props.comparisionField]);
        
            const appendCircle = (fill, radius, stroke = "#364B5F", strokeWidth = 2) => {
                tooltip.append("circle")
                .datum(d)
                .attr("r", radius)
                .attr("fill", fill)
                .attr("stroke", stroke)
                .attr("stroke-width", strokeWidth)
                .attr("cx", d => this.xScale(d.id))
                .attr("cy", d => this.yScale(+d[this.props.comparisionField]));
            }
                        
            if(this.props.type === "line-scatter") {
                appendCircle("#169F85", 8, "#169F85");
            } else {
                appendCircle("#364B5F", 4);
                appendCircle("none", 8);
            }
            
        }
    }
    render() {
        return (
            <div>
                <svg ref={svg => this.svg = svg}></svg>                
                <WaitMessage ref={waitMessage => this.WaitMessage = waitMessage} 
                             msg="Wait, please"
                />
             </div>
        );
    }
}