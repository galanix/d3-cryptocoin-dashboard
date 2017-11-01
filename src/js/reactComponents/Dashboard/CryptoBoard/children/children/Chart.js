import React from "react";

import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import PieChart from "./children/chartTypes/PieChart.js";
import BarChart from "./children/chartTypes/BarChart.js";
import LineChart from "./children/chartTypes/LineChart.js";
import HBarChart from "./children/chartTypes/HBarChart.js";

export default class Chart extends React.Component {
    constructor() {
        super();
        this.state = { ChartJSX: null };
    }
    renderChart(type, comparisionField) {
      const width = Math.round(this.svgDiv.getBoundingClientRect().width);      
      const height = Math.round(width / 2);
      const keys = Object.keys(this.props.hashTable);
      const dataset = keys.map(key => this.props.hashTable[key]);
      const colorValues = keys.map(key => this.props.hashTable[key].color);
      const color = d3.scaleOrdinal(colorValues);
      const currentSign = this.props.currentSign;

      let ChartJSX = null;
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

      switch(type) {
        case "pie":
        case "pie-donut":
          ChartJSX = ( <PieChart {...props} /> );
          break;

        case "bar":
          ChartJSX = ( <BarChart {...props} />);
          break;

        case "hbar":          
          ChartJSX = ( <HBarChart {...props} />);
          break;
          
        case "line":
        case "line-scatter":
        case "line-area":
          ChartJSX = ( <LineChart {...props} />);
          break;

        default:
          console.warn("chart has not been rendered");
      }

      this.setState({ ChartJSX });
    }
    render() {
      return (
        <div ref={div => this.svgDiv = div} className="graph">
            { this.state.ChartJSX }
        </div>
      );
    }
}