import React from "react";
import * as d3 from "d3";

export default class extends  React.Component {
    build() {
        // { dataset, comparisionField, onHoverHandler }
        let index = 0;
        const legend = d3.select(this.legend);
        
        legend.selectAll("*").remove(); // remove old legend items
        const items = legend.selectAll(".legend_item")
          .data(this.props.dataset) // add new legend items
          .enter()
          .append("div")
          .attrs({
            "data-index": () => index++,
            "class": "legend_item",
          })
          .on("mouseover", d => this.props.onHoverHandler(1, this.props.color(d[this.props.comparisionField]), d, this.props.comparisionField ))
          .on("mouseout", d => this.props.onHoverHandler(0, "#333", d, this.props.comparisionField));        
        items
          .append("span")
          .attr("class", "square")
          .style("background-color", d => this.props.color(d[this.props.comparisionField]));
    
        items
          .append("span")
          .text(d => d.name);
    }
    render() {
        return (
            <div ref={div => this.legend = div} className="legend"></div>
        )
    }
}