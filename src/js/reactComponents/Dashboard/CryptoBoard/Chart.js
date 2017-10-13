import React from "react";

import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import WordLengthTester from "./WordLengthTester";

export default class Chart extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    renderChart(type, comparisionField) {
        const width = Math.round(this.svgDiv.getBoundingClientRect().width);
        const height = Math.round(width / 2);
        const keys = Object.keys(this.props.hashTable);
        const dataset = keys.map(key => this.props.hashTable[key]);
        const colorValues = keys.map(key => this.props.hashTable[key].color);
        const afterAsyncIsDone = () => {
            this.state.chartSVG.attrs({ width, height });
            this.state.chartSVG.selectAll("*").remove();
            this.state.legend.selectAll("*").remove();
            // DYNAMICLY ADDED METHOD
            this.color = d3.scaleOrdinal(colorValues);        
            let onHoverHandler;
            switch(type) {
                case "pie": case "pie-donut":
                    this.renderPieChart({ dataset, width, height, comparisionField, chartIsDonut: type === "pie-donut" });
                    onHoverHandler = this.handleHoverEventPie.bind(this);
                    break;
                case "bar":
                    this.renderBarChart({ dataset, width, height, comparisionField });
                    onHoverHandler = this.handleHoverEventBar.bind(this);
                    break;
            }
            // BUILDING THE LEGEND
            this.buildLegendSection({ dataset, comparisionField, onHoverHandler });     
        };        

        if(!this.state.chartSVG && !this.state.legend) {
            this.setState({
                chartSVG: d3.select(this.svgDiv).append("svg").attr("id", "crypto-chart"),
                legend: d3.select(this.svgDiv).append("div").attr("class", "legend")
            }, afterAsyncIsDone);
        }
        else afterAsyncIsDone();        
    }
    buildLegendSection({ dataset, comparisionField, onHoverHandler }) {
        let index = 0;
        const items = this.state.legend.selectAll(".legend_item")
          .data(dataset)
          .enter()
          .append("div")
          .attrs({
            "data-index": () => index++,
            "class": "legend_item",
          })
          .on("mouseover", d => onHoverHandler(1, this.color(d[comparisionField]), d, comparisionField ))
          .on("mouseout", d => onHoverHandler(0, "#333", d, comparisionField));
    
        items
          .append("span")
          .attr("class", "square")
          .style("background-color", d => this.color(d[comparisionField]));
    
        items
          .append("span")
          .text(d => d.name);
    }
    renderPieChart({ dataset, width, height, comparisionField, chartIsDonut }) {        
        let radius;
        if(width > 800) radius = 150;
        else if(width > 500) radius = 100;
        else radius = Math.round(height / 2); // ? 50
    
        const holeRadius = Math.round(radius * 0.6); // for donut chart
        const labelr = radius + 20; // label radius        
        const g = this.state.chartSVG.append("g")
          .attrs({
            "transform": `translate(${width / 2}, ${height / 2})`,
            "class": "pie"
          });
        const midAngle = d => {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        };
    
        const [ min, max ] = d3.extent(dataset, d => +d[comparisionField]);
        let callback;
        if(max < 0) { // only negatives
          callback = d => (1 / Math.abs(+d[comparisionField]));
        } else if(min > 0) { // only positives
          callback = d => +d[comparisionField];
        } else { // mixed
          callback = d => +d[comparisionField] < 0 ? 0 : +d[comparisionField];
        }
        
        const pie = d3.pie()
          .sort(null)
          .value(d => callback(d));
        
        const path = d3.arc()
          .outerRadius(radius - 10)
          .innerRadius(chartIsDonut ? holeRadius : 0);
    
        const label = d3.arc()
          .outerRadius(labelr)
          .innerRadius(labelr);
    
        const arc = g.selectAll(".arc")
          .data(pie(dataset))
          .enter()
          .append("g")
          .attr("class", "arc")      
    
        // APPENDING SLICES OF A PIE
        arc
          .append("path")
          .attrs({
            d: path,
            fill: d => this.color(d.data[comparisionField]),
            stroke: "#fff"
          })
          .on("mouseover", () => this.togglePieLabel(d3.event.target.parentElement, 1))
          .on("mouseout", () => this.togglePieLabel(d3.event.target.parentElement, 0));
        
        const text = arc
          .append("text")
          .attrs({
            transform: d => {
              const pos = label.centroid(d);
              const direction = midAngle(d) < Math.PI ? 1 : -1;
              // determine polyline width and padd it
              pos[0] = labelr * direction;
              // determine the amount of space needed for word and padd it
              if(direction <  1) {
                const nameLength = this.WordLengthTester.getLengthOf(d.data.name);
                const valueLength = this.WordLengthTester.getLengthOf(d.data[comparisionField]);
                pos[0] -= nameLength < valueLength ? valueLength : nameLength;
              }
              return `translate(${pos})`;
            },
            "text-anchor": d => midAngle(d) / 2 > Math.PI ? "end" : "start",
            stroke: d => this.color(d.data[comparisionField]),
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
            .text(d => d.data[comparisionField]);

        arc
          .append("polyline")
          .attrs({
            stroke: d => this.color(d.data[comparisionField]),
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

    }
    handleHoverEventPie(opacityVal, color) {
        let item = d3.event.target;
        if(item.tagName !== "DIV") item = item.parentElement;
    
        item.getElementsByTagName("span")[1].style.color = color;
    
        const labels = Array.prototype.slice.call(document.getElementsByClassName("arc"));
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
            <div ref={div => this.svgDiv = div} className="graph">
                <WordLengthTester ref={WordLengthTester => this.WordLengthTester = WordLengthTester} />
            </div>
        );
    }
}