import React from "react";
import ReactDOM from "react-dom";

import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import PieChart from "./children/chartTypes/PieChart.js";
import BarChart from "./children/chartTypes/BarChart.js";
import LineChart from "./children/chartTypes/LineChart.js";
import HBarChart from "./children/chartTypes/HBarChart.js";

export default class Chart extends React.Component {
    constructor() {
        super();
        this.state = {
            duration: 300
        };
    }
    componentDidMount() {
      window.addEventListener("resize", () => {          
          if(!!this.state.prevType) {
              this.renderChart(this.state.prevType, this.state.prevComparisonField, true);
          }
      });
    }
    renderChart(type, comparisionField, reMountForcefully) {
        let width = Math.round(this.svgDiv.getBoundingClientRect().width);
        if(width > 600) {
            width = 600;
        }
        const height = Math.round(width / 2);
        const keys = Object.keys(this.props.hashTable);
        const dataset = keys.map(key => this.props.hashTable[key]);
        const colorValues = keys.map(key => this.props.hashTable[key].color);
        const color = d3.scaleOrdinal(colorValues);            
        const props = {
            color: color.bind(this),
            dataset,
            width,
            height,
            comparisionField,            
            type,
            drawCurrencySign: this.drawCurrencySign.bind(this)
        };
        let ChartJSX = null;

        switch(type) {
            case "pie":
            case "pie-donut":
                ChartJSX = ( <PieChart {...props} /> );
                break;

            case "bar":
                ChartJSX = ( <BarChart {...props} /> );
                break;

            case "hbar":
                ChartJSX = ( <HBarChart {...props} /> );
                break;
  
            case "line":
            case "line-scatter":
            case "line-area":
                ChartJSX = ( <LineChart {...props} /> );
                break;

            default:
                console.warn("chart has not been rendered");
        }
       
        const callback = () => {
            this.setState({
                ChildChartJSX: ChartJSX,
                prevType: type,
                prevComparisonField: comparisionField // for resize function
            });
        };

        if(this.state.prevType !== type || reMountForcefully) {
            this.setState({
                ChildChartJSX: null
            }, callback);
        } else {
            callback();
        }
    }
    drawCurrencySign(comparisionField, g, pos = {axis: "y"}) {
        const duration = this.state.duration;
        let sign = this.props.currentSign;        

        if(
            comparisionField.indexOf("price") === -1 &&
            comparisionField.indexOf("24h_volume") === -1 &&
            comparisionField.indexOf("market_cap") === -1
        ) {
            sign = "%";
        }

        const yAxis = g.select("g.axis--" + pos.axis);
        
        if(!yAxis.select("g.currency-sign").node()) {
            yAxis.append("g")
                .attrs({
                    "class": "currency-sign",                    
                })
                .append("text")
                .attrs({
                    "fill": "#000",
                    "font-size": "18",
                    "x": pos.axis === "x" ? pos.x : "4",                    
                });
        }
        const text = g.select(".currency-sign text");

        text            
            .transition()
            .duration(duration)
            .attrs({
                y: pos.axis === "x" ? "100" : "-100"
            });        

        setTimeout(() => {
            text         
                .html(sign)    
                .transition()
                .duration(duration)
                .attrs({
                    y: pos.axis === "x" ? pos.y : "-10"
                });            
        }, duration);
    }
    render() {
      return (
        <div ref={div => this.svgDiv = div} className="graph">
            { this.state.ChildChartJSX }
        </div>
      );
    }
}