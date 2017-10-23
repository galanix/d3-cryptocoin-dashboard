import React from "react";

import * as d3 from "d3";
import { attrs } from "d3-selection-multi";

import PieChart from "./children/chartTypes/PieChart.js";
import BarChart from "./children/chartTypes/BarChart.js";

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
        let deletePrevSvg = false;

        this.setState(prevState => ({
            color: d3.scaleOrdinal(colorValues),
            dataset,
            width,
            height,
            comparisionField,
            type: type
        }));
        
    }
    render() {
      let props;
      let ChartJSX = null;

      if(!!this.state) {
        props = {
          color: this.state.color,
          dataset: this.state.dataset,
          width: this.state.width,
          height: this.state.height,
          comparisionField: this.state.comparisionField,
          chartIsDonut: this.state.type === "pie-donut",
          type: this.state.type,
        };
      }
      switch(this.state.type) {
        case "pie":
        case "pie-donut":
          ChartJSX = ( <PieChart {...props} /> );
          break;
        case "bar":
          ChartJSX = ( <BarChart {...props} />);
          break;
        default:
          console.warn("chart has not been rendered");
      }
      return (
        <div ref={div => this.svgDiv = div} className="graph">
            { ChartJSX }
        </div>
      );
    }
}