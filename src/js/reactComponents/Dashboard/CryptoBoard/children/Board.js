import React from 'react';

import Filters from './children/Filters';
import Table from './children/Table';

export default class Board extends React.Component {
  constructor() {
    super();

    this.state = {
      componentToUpdate: 'CryptoBoard__table',
      // default values
      sortOrder: 'desc',
      iconJSX: <span className="fa fa-sort-desc" />,
      isTablePreloaderShown: false,
    };

    this.saveChanges = this.saveChanges.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.sortTable = this.sortTable.bind(this);

    this.showPreloader = this.showPreloader.bind(this);
    this.hidePreloader = this.hidePreloader.bind(this);

    this.filterByMarketCap = this.changeFilter.bind(this, this.updateTable, 'marketCap');
    this.filterByPrice = this.changeFilter.bind(this, this.updateTable, 'price');
    this.filterByVolume_24h = this.changeFilter.bind(this, this.updateTable, 'volume_24h');
    this.changeTableCurrency = this.changeFilter.bind(this, this.saveChanges, 'currency');
    this.changeTableLength = (target) => {
      this.showPreloader();
      this.changeFilter(this.saveChanges, 'limit', target);
    };
  }
  componentDidMount() {
    const { limit, currency } = this.props.model.filters;
    this.props.update(this.props.createURL(limit, currency), this.state.componentToUpdate)
      .then(() => this.setState({
        filteredData: this.props.model.data,
      }, () => {
        this.sortTable();
      }));
  }
  showPreloader() {
    this.setState({
      isTablePreloaderShown: true,
    });
  }
  hidePreloader() {
    this.setState({
      isTablePreloaderShown: false,
    });
  }
  changeFilter(callback, filterName, target) {
    // generalized function that handles many similar filter values changes
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
    let { sortTableValue } = this.props.model.filters;

    if (evt) {
      const { target } = evt;
      sortTableValue = target.getAttribute('data-sort-by');
      if (target.tagName !== 'TH' || !sortTableValue) {
        return;
      }
    }

    // selected column(target) will have an icon that would tell the order of sorted data - asc / desc
    const dataset = [...this.props.model.data]; // make a copy of current data
    // wrap code with a function to prevent duplication
    const saveSortedData = (newFilteredData, newSortTableValue, sortOrder) => {
      this.props.change(newSortTableValue, 'sortTableValue', this.state.componentToUpdate);
      this.props.update(null, this.state.componentToUpdate, newFilteredData);
      this.setState({
        iconJSX: <span className={`fa fa-sort-${sortOrder}`} />,
        filteredData: newFilteredData,
      }, () => {
        this.updateTable();
      });
    };

    if (
      this.props.model.filters.sortTableValue === sortTableValue
      && !!evt
    ) {
      // check for object evt is important because if it is undefined
      // then the TH was not clicked at all, so there's no previous TH

      // if the same TH is clicked
      // we just need to change order of the dataset
      this.setState(prevState => ({
        sortOrder: prevState.sortOrder === 'asc' ? 'desc' : 'asc',
      }), () => {
        saveSortedData(dataset.reverse(), sortTableValue, this.state.sortOrder);
      });
    } else {
      this.setState({
        sortOrder: 'desc', // the default
      }, () => {
        let ascending;
        let descending;
        let prop = sortTableValue;

        if (
          prop.indexOf('market_cap_') !== -1
          || prop.indexOf('24h_volume_') !== -1
          || prop.indexOf('price_') !== -1
        ) {
          // prop/sortTableValue is not complete for these three values,
          // we need to add currently selected currency to it,
          // ex: price_ + 'USD'.toLowerCase() --> price_usd
          prop += this.props.model.filters.currency.toLowerCase();
        }

        if (sortTableValue !== 'name') {
          // for numbers
          descending = (curr, next) => next[prop] - curr[prop];
          ascending = (curr, next) => curr[prop] - next[prop];
        } else {
          // for strings
          descending = (curr, next) => next[prop].localeCompare(curr[prop]);
          ascending = (curr, next) => curr[prop].localeCompare(next[prop]);
        }

        const sortingMethod = this.state.sortedOrder === 'asc' ? ascending : descending;
        saveSortedData(dataset.sort(sortingMethod), sortTableValue, this.state.sortOrder);
      });
    }
  }
  saveChanges() {
    const { limit, currency } = this.props.model.filters;

    this.props.update(this.props.createURL(limit, currency), this.state.componentToUpdate)
      .then(() => {
        this.setState({
          filteredData: this.props.model.data,
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
          colToSort={this.props.model.filters.sortTableValue}
          onClickHandler={this.props.toggleCheckbox}
          sortTable={this.sortTable}
          hashTable={this.props.hashTable}
          sortOrderIcon={this.state.iconJSX}
          isPreloaderShown={this.state.isTablePreloaderShown}
          hidePreloader={this.hidePreloader}
        />
      </div>
    );
  }
};