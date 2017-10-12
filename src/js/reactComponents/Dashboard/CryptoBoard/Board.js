import React from "react";

import Filters from "./Filters";
import Table from "./Table";

export default class Board extends React.Component {
    constructor() {
        super();
        this.state = {
            componentToUpdate: "CryptoBoard_table",            
        };
    }  
    filterTable(filterName, target) {
        const newFilterValue = target.getAttribute("data-value");
       
        this.props.change(newFilterValue, filterName, this.state.componentToUpdate);


        // UPDATES THE TABLE

        const { marketCap, price, volume_24h } = this.props.model.filters;
        const filterValues = this.props.model.filterValues;

        // helper functions
        const defineConstraints = (key, vals) => {
          let min;
          let max;
          if(vals[key] instanceof Array) {
            min = vals[key][0];
            max = vals[key][1];
          } else min = vals[key];
          return {
            min,
            max
          };
        };
        const constraintPasses = (range, val) => {
          if(typeof range.min !== "string") {
            if(
              +val < range.min ||
              +val > range.max
            ) {
              return false;
            }
          }
          return true;
        };
  
        const marketCapRange = defineConstraints(marketCap, filterValues.marketCap);
        const priceRange = defineConstraints(price, filterValues.price);
        const volume_24hRange = defineConstraints(volume_24h, filterValues.volume_24h);
  
        const data = this.props.model.data.filter(item => {
          return constraintPasses(marketCapRange, item.market_cap_usd) &&
                 constraintPasses(priceRange, item.price_usd) &&
                 constraintPasses(volume_24hRange, item["24h_volume_usd"]);
        });

        this.setState({
            filteredData: data
        });
    }
    clearFilters() {
        const filterNames = [ "marketCap", "price", "volume_24h" ];
        const newFilterValues = [ "0", "0", "0" ]; // default values

        this.props.change(newFilterValues, filterNames, this.state.componentToUpdate);

        this.setState({
            filteredData: this.props.model.data
        });        
    }
    componentDidMount() {
        this.props.update(this.createURL(), this.props.display, this.state.componentToUpdate)
          .then(() => this.setState({
              filteredData: this.props.model.data
          }));
    }
    createURL() {
        const { limit, currency } = this.props.model.filters;
        return this.props.url + `?convert=${currency}&limit=${limit}`;
    }
    render() {        
        return (
            <div>
                <Filters filterByMarketCap={this.filterTable.bind(this, "marketCap")}
                         filterByPrice={this.filterTable.bind(this, "price")}
                         filterByVolume_24h={this.filterTable.bind(this, "volume_24h")}
                         clearFilters={this.clearFilters.bind(this)}
                         filters={this.props.model.filters}
                />
                <Table dataset={ (!this.state.filteredData || Object.keys(this.state.filteredData).length === 0) ? [] : this.state.filteredData }
                       currency={this.props.model.filters.currency}
                />
            </div>
        );
    }
};