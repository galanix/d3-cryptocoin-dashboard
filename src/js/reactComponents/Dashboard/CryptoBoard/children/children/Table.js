import React from 'react';
import * as d3 from 'd3-format';
// import d3 from 'd3-format';

export default class Table extends React.Component {
  // data-sort-by values are properties in a single item of datase
  generateTH(colVal, textVal) {
    return (
      <th data-sort-by={colVal} key={colVal}>
        { this.props.colToSort === colVal ? this.props.sortOrderIcon : null }
        { textVal }
      </th>
    );
  }
  render() {
    const thElements = {
      Name: 'name',
      'Market Cap': 'market_cap_',
      Price: 'price_',
      'Circulating Supply': 'available_supply',
      'Volume(24h)': '24h_volume_',
      '%1h': 'percent_change_1h',
      '%24h': 'percent_change_24h',
      '%7d': 'percent_change_7d',
    };

    const formatToInt = d3.format(',.0');
    const formatToFloat = d3.format(',.2f');
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="table-responsive">
            <table
              id="datatable-checkbox"
              className="table table-striped table-bordered bulk_action"
            >
              <thead>
                <tr onClick={evt => this.props.sortTable(evt)} >
                  <th>
                    <i className="fa fa-check" />
                  </th>
                  <th>#</th>

                  { Object.keys(thElements).map(key => this.generateTH(thElements[key], key)) }
                  
                </tr>
              </thead>
              <tbody onClick={evt => this.props.onClickHandler(evt)}>
                {
                  this.props.dataset instanceof Array ?
                    this.props.dataset.map((item, index) => (
                      <tr key={Math.random().toString(36).slice(2)}>
                        <td data-toggle="button">
                          <button
                            className={`btn btn-xs btn-dark ${(!this.props.hashTable || !this.props.hashTable[item.id]) ? '' : 'active'}`}
                            data-currency-id={item.id}
                          >
                            <span className="fa fa-check" />
                          </button>
                        </td>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{formatToInt(item[`market_cap_${this.props.currency.toLowerCase()}`])}</td>
                        <td>{formatToFloat(item[`price_${this.props.currency.toLowerCase()}`])}</td>
                        <td>{formatToInt(item.available_supply)}</td>
                        <td>{formatToInt(item[`24h_volume_${this.props.currency.toLowerCase()}`])}</td>
                        <td>{item.percent_change_1h}</td>
                        <td>{item.percent_change_24h}</td>
                        <td>{item.percent_change_7d}</td>
                      </tr>
                    ))
                    :
                    null
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}