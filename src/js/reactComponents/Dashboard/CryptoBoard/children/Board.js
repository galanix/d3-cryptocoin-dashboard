import React from 'react';

import Filters from './children/Filters';
import Table from './children/Table';

export default class Board extends React.Component {
  constructor() {
    super();

    this.state = {
      componentToUpdate: 'CryptoBoard_table',
      sortValue: 'market_cap',
      sortOrder: 'desc' // asc
    };

    this.saveChanges = this.saveChanges.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.sortTable = this.sortTable.bind(this);

    this.filterByMarketCap = this.changeFilter.bind(this, this.updateTable, 'marketCap');
    this.filterByPrice = this.changeFilter.bind(this, this.updateTable, 'price');
    this.filterByVolume_24h = this.changeFilter.bind(this, this.updateTable, 'volume_24h');
    this.changeTableCurrency = this.changeFilter.bind(this, this.saveChanges, 'currency');
    this.changeTableLength = this.changeFilter.bind(this, this.saveChanges, 'limit');
  }
  componentDidMount() {
      const { limit, currency } = this.props.model.filters;
      this.props.update(this.props.createURL(limit, currency), this.state.componentToUpdate)
          .then(() => this.setState({
              filteredData: this.props.model.data
          }));
  }
  changeFilter(callback, filterName, target) { // generalized function that handles many similar filter values changes
    const newFilterValue = target.getAttribute('data-value');    

    this.props.change(newFilterValue, filterName, this.state.componentToUpdate);
    
    callback();
  }
  updateTable() {
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
      } else {
          min = vals[key];
      }

      return {
          min,
          max
      };
    };
    const constraintPasses = (range, val) => {
      if(typeof range.min !== 'string') {
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
      return constraintPasses(marketCapRange, item.market_cap_usd)
        && constraintPasses(priceRange, item.price_usd)
        && constraintPasses(volume_24hRange, item['24h_volume_usd']);
    });

    this.setState({
      filteredData: data
    });
  }
  sortTable(evt) {
    const target = evt.target;
    const sortByValue = target.getAttribute('data-sort-by');
    if(target.tagName !== 'TH' || !sortByValue) {
      return;
    }
    
    

  }
  saveChanges() {
    const {limit, currency} = this.props.model.filters;        

    this.props.update(this.props.createURL(limit, currency), this.state.componentToUpdate)
      .then(() => {
        this.setState({
          filteredData: this.props.model.data
        }, () => {
          this.updateTable();
        });
      });
  }  
  clearFilters() {
    const filterNames = [ 'marketCap', 'price', 'volume_24h' ];
    const newFilterValues = [ '0', '0', '0' ]; // default values

    this.props.change(newFilterValues, filterNames, this.state.componentToUpdate);

    this.setState({
      filteredData: this.props.model.data
    });        
  }
  render() {
    return (
      <div>
        <Filters 
          filterByMarketCap={this.filterByMarketCap}
          filterByPrice={this.filterByPrice}
          filterByVolume_24h={this.filterByVolume_24h}                         
          changeTableCurrency={this.changeTableCurrency}
          changeTableLength={this.changeTableLength}
          clearFilters={this.clearFilters}
          filters={this.props.model.filters}
        />
        <Table
          dataset={this.state.filteredData || []}
          currency={this.props.model.filters.currency}
          onClickHandler={this.props.toggleCheckbox}
          sortTable={this.sortTable}
          hashTable={this.props.hashTable}
        />
      </div>
    );
  }
};