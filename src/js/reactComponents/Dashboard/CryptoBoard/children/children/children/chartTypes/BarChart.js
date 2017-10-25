import React from "react";
import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import Legend from "../Legend.js";

import { twoArraysAreEqual } from "../../../../../../../helperFunctions.js";

export default class BarChart extends React.Component {
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
      const margin = { top: 30, right: 10, bottom: 50, left: 50 };
      const fixedWidth = this.props.width - (margin.left + margin.right);
      const fixedHeight = this.props.height - (margin.top + margin.bottom);
      this.setState({ fixedHeight }); // will need this variable later on
      const svg = d3.select(this.svg);

      svg.attr("width", this.props.width);
      svg.attr("height", this.props.height);

      this.yScale = d3.scaleLinear()
        .range([fixedHeight, 0])
        .nice();
      this.xScale = d3.scaleBand()        
        .padding(0.2)
        .rangeRound([0, fixedWidth], 0.2);

      this.setState({
        g: svg.append("g")
            .attrs({
              "transform": `translate(${margin.left}, ${margin.top})`,
              "class": "bar"
            })
      }, () => {
        this.state.g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + fixedHeight + ")");

        this.state.g.append("g")
          .attr("class", "axis axis--x axis--zero");

        this.state.g.append("g")
          .attr("class", "axis axis--y");               

        this.updateSVG();
      });
    }
    updateSVG() {
      let max = d3.max(this.props.dataset, d => +d[this.props.comparisionField]);
      max = max < 0 ? 0 : max;
      let min = d3.min(this.props.dataset, d => +d[this.props.comparisionField]);
      min = min > 0 ? 0 : min;
      
      this.yScale.domain([min, max]);
      this.xScale.domain(this.props.dataset.map((_d, i) => ++i));
      
      this.state.g.select("g.axis--x")
        .call(d3.axisBottom(this.xScale).tickValues(this.props.dataset.map((_d, i) => ++i)))
        .transition()
        .duration(300)
        .style("shape-rendering", "crispEdges");

      this.state.g.select(".bar .axis--x").selectAll(".tick")
        .data(this.props.dataset)
        .attr("data-currency-id", d => d.id)
        .attr("data-index", (_d, i) => ++i);

      this.state.g.select("g.axis--zero")
        .attr("transform", `translate(0, ${this.yScale(0)})`)
        .style("opacity", 0.4)
        .transition()
        .duration(300)
        .call(d3.axisBottom(this.xScale).tickFormat(""));

      this.state.g.select("g.axis--y")
        .transition()
        .duration(300)
        .call(d3.axisLeft(this.yScale).ticks(10));
      
      const rects = this.state.g.selectAll("rect")
        .data(this.props.dataset);

      rects
        .exit()      
        .remove();

      rects
        .enter()
          .append("rect")
        .merge(rects)
          .attr("y", this.yScale(min))
          .attr("height", this.state.fixedHeight - this.yScale(min))
                
      this.state.g.selectAll("rect")
        .on("mouseover", d => this.toggleBar(d3.event.target.getAttribute("data-currency-id"), d, false))
        .on("mouseout", d => this.toggleBar(d3.event.target.getAttribute("data-currency-id"), d, true))
        .transition()
        .duration(300)
        .attrs({
          "fill":  d => this.props.color(+d[this.props.comparisionField]),
          "width": () => this.xScale.bandwidth() > 200 ? 200 : this.xScale.bandwidth(),
          "data-currency-id": d => d.id,
          "x": (_d,i) => this.xScale(i + 1) + (this.xScale.bandwidth() > 200 ? (this.xScale.bandwidth() - 200) / 2 : 0),
          "y": d => +d[this.props.comparisionField] < 0 ? (this.yScale(0)) : this.yScale(+d[this.props.comparisionField]),
          "height": d => Math.abs(this.yScale(+d[this.props.comparisionField]) - (this.yScale(0))),
        })        

      this.legend.build();
    }
    toggleBar(id, d, mouseOut) {
      const xTicks = Array.from(this.svg.parentElement.parentElement.querySelector(".axis--x").querySelectorAll(" .tick"));      
      const rects = Array.from(d3.selectAll(".bar rect").nodes());
      
      const elementInArray = d => d.getAttribute("data-currency-id") === id;      

      const tick = xTicks.find(elementInArray);
      const rect = rects.find(elementInArray);

      const show = r => { if(r !== rect) r.style.opacity = 0.2; }; // r - rect
      const hide = r => r.style.opacity = 1;
      const display = mouseOut ? hide : show;            
      rects.forEach(display);

      const onMouseMove = ({ text, innerHTML, styles }) => {        
        for(let prop in styles) {
          text.style[prop] = styles[prop];
        }        
        text.innerHTML = innerHTML;
      };
      const text = tick.getElementsByTagName("text")[0];     
      if(mouseOut) {
        onMouseMove({ 
          text, 
          innerHTML: tick.getAttribute("data-index"),
          styles: {  fontSize: "1em", fill: "#333", fontWeight: "normal" } 
        });
      } else {        
        onMouseMove({
          text,
          innerHTML: `
            <tspan x="0">${d.name}</tspan>
            <tspan x="0" dy="1.2em">${d[this.props.comparisionField]}</tspan>
          `,
          styles: { fontSize: "1.5em", fill: this.props.color(+d[this.props.comparisionField]) , fontWeight: "bold" }
        });
      }
    }
    handleHoverEvtHandler(opacityVal, color, d) {
        let item = d3.event.target;
        if(item.tagName !== "DIV") item = item.parentElement;    
    
        item.getElementsByTagName("span")[1].style.color = color;
    
        const id = item.getAttribute("data-currency-id");        
        this.toggleBar(id, d, (opacityVal === 1 ? false : true));            
    }
    render() {
        return (
            <div>              
              <svg ref={svg => this.svg = svg}></svg>
              <Legend  ref={legend => this.legend = legend}
                       onHoverHandler={this.handleHoverEvtHandler.bind(this)}
                       color={this.props.color}
                       comparisionField={this.props.comparisionField}
                       dataset={this.props.dataset}
              />
            </div>
        );
    }
}