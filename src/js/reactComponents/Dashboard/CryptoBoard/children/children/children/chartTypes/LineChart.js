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
        const margin = { top: 30, right: 10, bottom: 50, left: 50 };
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
        const ids = this.props.dataset.map(d => d.id);
        const [min, max] = d3.extent(this.props.dataset, d => +d[comparisionField]);
        const yTicks = formTickValues({
            finalLevel: 3,
            level: 1,
            prevLg: max,
            prevSm: min
        });
        
        this.yScale.domain([min, max]);
        this.xScale.domain(ids);

        console.log(comparisionField);

        this.state.g.select("g.axis--x")
            .transition()
            .duration(300)
            .call(d3.axisBottom(this.xScale).tickValues(ids));

        this.state.g.select("g.axis--y")
            .transition()
            .duration(300)
            .call(d3.axisLeft(this.yScale).tickValues(yTicks));

        if(!this.state.line) {            
            this.setState({
                line: new Graph({
                        type: this.props.type,
                        color: "#169F85",
                        hidden: false,
                        lineFunction:  d3.line()
                                        .x(d => this.xScale(d.id))
                                        .y(d => this.yScale(+d[comparisionField])),
                        container: this.state.g
                    })
            }, () => {               
                this.state.line.append(this.props.dataset);
            });
        } else {
            // update comparisonField value to prevent getting old value from closure
            this.state.line.lineFunction.y(d => this.yScale(+d[comparisionField]));
            this.state.line.update(this.props.dataset);
        }
        this.drawCurrencySign();
        this.legend.build();    
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
    handleHoverEvtHandler() {    
    }
    render() {
        return (
            <div>              
                <svg ref={svg => this.svg = svg}></svg>
                <Legend ref={legend => this.legend = legend}
                        onHoverHandler={this.handleHoverEvtHandler.bind(this)}
                        color={this.props.color}
                        comparisionField={this.props.comparisionField}
                        dataset={this.props.dataset}
                />
                <WaitMessage ref={waitMessage => this.WaitMessage = waitMessage} 
                             msg="Wait, please"
                />
             </div>
        );
    }
}