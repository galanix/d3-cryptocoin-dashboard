import React from "react";
import * as d3 from "d3";

import Legend from "../Legend.js";

import { twoArraysAreEqual } from "../../../../../../../helperFunctions.js";

export default class BarChart extends React.Component {
    componentDidMount() {
      this.renderSVG();
    }    
    componentWillReceiveProps(newProps) {
      if(newProps.type !== this.props.type) {
        d3.select(this.svg.parentElement).remove();
      }
      if(
        twoArraysAreEqual(newProps.dataset, this.props.data) &&
        newProps.width === this.props.width &&
        newProps.height === this.props.height &&
        newProps.comparisionField === this.props.comparisionField
      ) {
        this.renderSVG();
      }
    }
    renderSVG() {
      const margin = { top: 30, right: 10, bottom: 50, left: 50 };
      const fixedWidth = this.props.width - (margin.left + margin.right);
      const fixedHeight = this.props.height - (margin.top + margin.bottom);
      const svg = d3.select(this.svg);

      svg.attr("width", this.props.width);
      svg.attr("height", this.props.height);      
      
  
      let max = d3.max(this.props.dataset, d => +d[this.props.comparisionField]);
      max = max < 0 ? 0 : max;
      let min = d3.min(this.props.dataset, d => +d[this.props.comparisionField]);
      min = min > 0 ? 0 : min;
      
      const yScale = d3.scaleLinear()
        .domain([min, max])
        .range([fixedHeight, 0])
        .nice();
      
      const xScale = d3.scaleBand()
        .domain(this.props.dataset.map((_d, i) => ++i))
        .padding(0.2)
        .rangeRound([0, fixedWidth], 0.2);
  
      const g = svg.append("g")
        .attrs({
          "transform": `translate(${margin.left}, ${margin.top})`,
          "class": "bar"
        });

      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + fixedHeight + ")")
        .call(d3.axisBottom(xScale))
        .style("shape-rendering", "crispEdges");
        
      g.append("g")
        .attr("class", "axis axis--x axis--zero")
        .attr("transform", `translate(0, ${yScale(0)})`)
        .style("opacity", 0.4)
        .call(d3.axisBottom(xScale).tickFormat("").tickSize(0));
  
      g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(yScale).ticks(10))      
  
      const bars = g.selectAll(".col")
        .data(this.props.dataset)
        .enter()
        .append("g")
        .attr("class", "col");
        
      bars
        .append("rect")
        .attrs({
          "fill":  d => this.props.color(+d[this.props.comparisionField]),
          "width": () => xScale.bandwidth() > 200 ? 200 : xScale.bandwidth(),
          "data-index": (_d,i) => i,
          "x": (_d,i) => xScale(++i) + (xScale.bandwidth() > 200 ? (xScale.bandwidth() - 200)/2 : 0),
          "y": d => +d[this.props.comparisionField] < 0 ? (yScale(0)) :  yScale(+d[this.props.comparisionField]),
          "height": d => Math.abs(yScale(+d[this.props.comparisionField]) - (yScale(0))),
        })
        .on("mouseover", d => this.toggleBarLabel(d3.event.target.getAttribute("data-index"), d, this.props.comparisionField))
        .on("mouseout", d => this.toggleBarLabel(d3.event.target.getAttribute("data-index"), d, this.props.comparisionField, true));

        this.legend.build();     
    }
    toggleBarLabel(index, d, comparisionField, mouseOut) {
        index = +index;
        const tickGroups = this.svg.parentElement.querySelectorAll(`.bar .axis--x .tick`);
        const line = tickGroups[index].getElementsByTagName("line")[0];
        const text = tickGroups[index].getElementsByTagName("text")[0];
        const callback = !mouseOut ?
          g => {        
            if(g !== tickGroups[index]) g.getElementsByTagName("text")[0].style.opacity = 0;
          } :
          g => g.getElementsByTagName("text")[0].style.opacity = 1;
    
        tickGroups.forEach(callback);
        
        if(!mouseOut) {
          const color = this.props.color(+d[this.props.comparisionField]);
          text.style.fontSize = "1.5em";
          text.style.fill = color;
          text.style.fontWeight = "bold";
          text.innerHTML = `
            <tspan x="0">${d.name}</tspan>
            <tspan x="0" dy="1.2em">${d[this.props.comparisionField]}</tspan>
          `;
          line.style.stroke = color;
          line.style["stroke-width"] = 3;
        } else {      
          text.style.fontSize = "1em";
          text.style.fill = "#000";
          text.style.fontWeight = "normal";
          text.innerHTML = ++index;
    
          line.style.stroke = "#000";
          line.style["stroke-width"] = 1;
        }  
    }
    handleHoverEvtHandler(opacityVal, color, d, comparisionField) {
        let item = d3.event.target;
        if(item.tagName !== "DIV") item = item.parentElement;    
    
        item.getElementsByTagName("span")[1].style.color = color;
    
        const index = item.getAttribute("data-index");
        const rects = document.querySelectorAll(".col rect");
        const rect = rects[index];
        this.toggleBarLabel(index, d, comparisionField, (opacityVal === 1 ? false : true));
    
        const callback = opacityVal === 1 ?
          label => {
            if(label !== rect) {
              label.style.opacity = 0.25;
            }
          } :
          label => {
            label.style.opacity = 1;
          };
        
        rects.forEach(callback);
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