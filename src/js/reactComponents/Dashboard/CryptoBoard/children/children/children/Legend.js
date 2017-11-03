import React from "react";
import * as d3 from "d3";

export default class extends React.Component {
    build() {
        const legend = d3.select(this.legend);
        
        legend.selectAll(".legend_item").remove();
        
        const items = legend.selectAll(".legend_item")
            .data(this.props.dataset)
            .enter()
            .append("div")
            .attr("data-currency-id", d => d.id)
            .attr("class", "legend_item")       
            .on("mouseover", d => this.props.onHoverHandler(1, this.props.color(d[this.props.comparisionField]), d))
            .on("mouseout", d => this.props.onHoverHandler(0, "#73879C", d));
        
        items
            .append("span")
            .attr("class", "square")
            .style("background-color", d => this.props.color(d[this.props.comparisionField]));
        
        items
            .append("span")
            .text(d => d.name)
            .style("font-weight", "bold");
        
    }
    render() {
        return (
            <div ref={div => this.legend = div} className="legend"></div>
        )
    }
}