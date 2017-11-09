import React from "react";
import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import WaitMessage from "../../../../../../General/WaitMessage.js";
import Legend from "../Legend.js";

import Graph from "../../../../../../../components/Graph.js";

import {formTickValues} from "../../../../../../../helperFunctions.js";

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
    shouldComponentUpdate(nextProps) {
      return this.props.didPropsUpdate(nextProps, this.props);
    }   
    componentDidUpdate() {
      this.updateSVG();
    }      
    renderSVG() {
      const margin = this.props.margin;
      const actualWidth = this.props.width - (margin.left + margin.right);
      const actualHeight = this.props.height - (margin.top + margin.bottom);      
      const svg = d3.select(this.svg);

      this.setState({ actualHeight });

      svg.attr("width", this.props.width)
        .attr("height", this.props.height);

      this.xScale = d3.scalePoint()
        .range([0, actualWidth])
        .padding(0.2)

      this.yScale = d3.scaleLinear()
        .range([actualHeight, 0]);

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
              "transform": `translate(0, ${actualHeight})`,
              "class": "axis--x"
            });

        this.updateSVG();
      });       
    }
    updateSVG() {
      const g = this.state.g;
      const comparisionField = this.props.comparisionField;
      const dataset = this.props.dataset;
      const ids = dataset.map(d => d.id);
      const [min, max] = d3.extent(dataset, d => +d[comparisionField]); 
      const type = this.props.type;
      const yTicks = formTickValues({
        finalLevel: 3,
        level: 1,
        prevLg: max,
        prevSm: min
      });
    
      this.yScale.domain([min, max]);
      this.xScale.domain(ids);

      // Y AXIS
      const yAxis = g.select("g.axis--y");
      
      yAxis
        .transition()
        .duration(300)
        .call(d3.axisLeft(this.yScale).tickValues(yTicks));
      
      const recalcXScaleRange = margin => {
        const actualWidth = this.props.width - (margin.left + margin.right);
        this.xScale.range([0, actualWidth]);
      };
      const recalcXTranslate = margin => {
        this.state.g.attr('transform', `translate(${margin.left}, ${margin.top})`);
      };

      this.props.recalc(yAxis, this.props.margin, [
        recalcXScaleRange,
        recalcXTranslate
      ]);
            
      // X AXIS
      g.select("g.axis--x")
        .transition()
        .duration(300)
        .call(d3.axisBottom(this.xScale).tickValues(ids));

      g.selectAll(".axis--x text")
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
      
      // ACTUAL CHART BUILDING
      if(type === "line") {
        this.buildLine();
      } else if(type === "line-scatter") {
        this.buildScatterPlot();
      } else if(type === "line-area") {
        this.buildAreaPlot();
      }

      this.props.drawCurrencySign(comparisionField, g);        
    }
    createGraphInstance(graph, appendCallback, updateCallback, params) {
      // typeof graph === string        
      if(!this.state[graph]) {
        this.setState({
          [graph]: new Graph(Object.assign({}, params))
        }, () => {                
          appendCallback(graph);
        })
      } else {
        updateCallback(graph);
      }
    }
    buildLine(customStrokeWidth) {
      const appendCallback = graph => {
        this.state[graph].append(this.props.dataset);
      };
      const updateCallback = graph => {
        // update comparisonField value to prevent getting old value from closure
        this.state[graph].lineFunction.y(d => this.yScale(+d[this.props.comparisionField]));
        this.state[graph].update(this.props.dataset);
      };
      const params = {
        type: "line",
        color: "#169F85",
        hidden: false,
        strokeWidth: customStrokeWidth || 2,
        lineFunction:  d3.line()
                         .x(d => this.xScale(d.id))
                         .y(d => this.yScale(+d[this.props.comparisionField])),
        container: this.state.g
      };

      this.createGraphInstance("line", appendCallback, updateCallback, params);        
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
      const appendCallback = graph => {
        this.state[graph].append(this.props.dataset);
      };
      const updateCallback = graph => {
        this.state[graph].lineFunction.y1(d => this.yScale(+d[this.props.comparisionField]));
        this.state[graph].update(this.props.dataset);
      };
      const params = {
        type: "area",
        color: "#169F85",
        fill: "#169F85",
        opacityVal: 0.5,
        hidden: false,
        lineFunction: d3.area()
                        .x(d => this.xScale(d.id))
                        .y0(this.state.actualHeight)
                        .y1(d => this.yScale(d[this.props.comparisionField])),
        container: this.state.g
      };
    
      this.createGraphInstance("area", appendCallback, updateCallback, params);
      this.buildLine(4);
    }
    showPreloader() {
      this.WaitMessage.show();
    }
    hidePreloader() {
      this.WaitMessage.hide();
    } 
    handleHoverEvtHandler(id, mouseOut) {
      const d = this.props.dataset.find(item => item.id === id);
      const comparisionField = this.props.comparisionField;
      const sign = this.props.determineSign(comparisionField);

      // mw - modal window
      if(mouseOut) {
        this.state.g.selectAll(".tooltip--mw").transition().duration(100).style("opacity", 0).remove();
      } else {
        const tooltip = this.state.g.append("g").attr("class", "tooltip--mw");
        
        tooltip.append("text")
          .datum(d)
          .attr("stroke", "#364B5F")
          .attr("x", d => this.xScale(d.id))
          .attr("y", d => this.yScale(+d[comparisionField]) - 15)
          .attr("text-anchor", "middle")
            .html(d => sign + d[comparisionField]);
    
        const appendCircle = (fill, radius, stroke = "#364B5F", strokeWidth = 2) => {
          tooltip.append("circle")
            .datum(d)
            .attr("r", radius)
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("cx", d => this.xScale(d.id))
            .attr("cy", d => this.yScale(+d[comparisionField]));
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