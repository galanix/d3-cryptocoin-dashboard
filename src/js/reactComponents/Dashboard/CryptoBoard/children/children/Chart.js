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
        this.state = {};
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
        const currentSign = this.props.currentSign;        
        const props = {
            color: color.bind(this),
            dataset,
            width,
            height,
            comparisionField,
            chartIsDonut: type === "pie-donut",
            type,
            currentSign
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
    render() {
      return (
        <div ref={div => this.svgDiv = div} className="graph">
            { this.state.ChildChartJSX }
        </div>
      );
    }
}