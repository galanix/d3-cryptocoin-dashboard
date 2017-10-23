import React from "react";
import * as d3 from "d3";

import Legend from "../Legend.js";
import WordLengthTester from "./children/WordLengthTester.js";

import { twoArraysAreEqual } from "../../../../../../../helperFunctions.js";

export default class PieChart extends React.Component {
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
      let radius;
      if(this.props.width > 800) radius = 150;
      else if(this.props.width > 500) radius = 100;
      else radius = Math.round(this.props.height / 2); // ? 50
  
      const holeRadius = Math.round(radius * 0.6); // for donut chart
      const labelr = radius + 20; // label radius
      const svg = d3.select(this.svg);
      const g = svg.append("g")
        .attrs({
          "transform": `translate(${this.props.width / 2}, ${this.props.height / 2})`,
          "class": "pie"
        });        
      const midAngle = d => {
          return d.startAngle + (d.endAngle - d.startAngle) / 2;
      };
  
      const [ min, max ] = d3.extent(this.props.dataset, d => +d[this.props.comparisionField]);
      let callback;
      if(max < 0) { // only negatives
        callback = d => (1 / Math.abs(+d[this.props.comparisionField]));
      } else if(min > 0) { // only positives
        callback = d => +d[this.props.comparisionField];
      } else { // mixed
        callback = d => +d[this.props.comparisionField] < 0 ? 0 : +d[this.props.comparisionField];
      }

      svg.attr("width", this.props.width);
      svg.attr("height", this.props.height);
      
      const pie = d3.pie()
        .sort(null)
        .value(d => callback(d));
      
      const path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(this.props.chartIsDonut ? holeRadius : 0);
  
      const label = d3.arc()
        .outerRadius(labelr)
        .innerRadius(labelr);
  
      const arc = g.selectAll(".arc")
        .data(pie(this.props.dataset))
        .enter()
        .append("g")
        .attr("class", "arc")      
  
      // APPENDING SLICES OF A PIE
      arc
        .append("path")
        .attrs({
          d: path,
          fill: d => this.props.color(d.data[this.props.comparisionField]),
          stroke: "#fff"
        })
        .on("mouseover", () => this.togglePieLabel(d3.event.target.parentElement, 1))
        .on("mouseout", () => this.togglePieLabel(d3.event.target.parentElement, 0));
      
      const text = arc
        .append("text")
        .attrs({
          "transform": d => {
            const pos = label.centroid(d);
            const direction = midAngle(d) < Math.PI ? 1 : -1;
            // determine polyline width and padd it
            pos[0] = labelr * direction;
            // determine the amount of space needed for word and padd it
            if(direction <  1) {
              const nameLength = this.WordLengthTester.getLengthOf(d.data.name);
              const valueLength = this.WordLengthTester.getLengthOf(d.data[this.props.comparisionField]);
              pos[0] -= nameLength < valueLength ? valueLength : nameLength;
            }
            return `translate(${pos})`;
          },
          "text-anchor": d => midAngle(d) / 2 > Math.PI ? "end" : "start",
          stroke: d => this.props.color(d.data[this.props.comparisionField]),
        })
        .style("font-size", "16px")
        .style("opacity", 0)

      setTimeout(() => text.style("transition", "opacity .5s ease-in"), 500);

      text
        .append("tspan")
          .attrs({
            x: "0",
            dy: "-0.35em",
          })
          .text(d => d.data.name);

      text
        .append("tspan")
          .attrs({
            x: "0",
            dy: "1.1em",
          })
          .style("font-size", ".75em")
          .text(d => d.data[this.props.comparisionField]);

      arc
        .append("polyline")
        .attrs({
          stroke: d => this.props.color(d.data[this.props.comparisionField]),
          "stroke-width": 2,
          fill: "none",
          points: d => {
            const pos = label.centroid(d);
            const direction = midAngle(d) < Math.PI ? 1 : -1;
            pos[0] = labelr * direction;
            return [ path.centroid(d), label.centroid(d), pos ];
          }
        })
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("transition", "opacity .5s ease-in");

      this.legend.build();
    }
    handleHoverEvtHandler(opacityVal, color) {
        let item = d3.event.target;
        if(item.tagName !== "DIV") item = item.parentElement;
    
        item.getElementsByTagName("span")[1].style.color = color;
    
        const labels = Array.from(document.getElementsByClassName("arc"));
        const label = labels[item.getAttribute("data-index")];
        this.togglePieLabel(label, opacityVal);
    
        const callback = opacityVal === 1 ?
          labelItem => {
            if(labelItem !== label) labelItem.style.opacity = 0.25;
          }
        :
          labelItem => {
            labelItem.style.opacity = 1;
          };
    
        labels.forEach(callback);
    }
    togglePieLabel(parent, opacityVal) {
        parent.getElementsByTagName("text")[0].style.opacity = opacityVal;
        parent.getElementsByTagName("polyline")[0].style.opacity = opacityVal;
    }
    render() {
        return (
            <div>
              <WordLengthTester ref={div => this.WordLengthTester = div} />
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