import React from 'react';

export default class Table extends React.Component {
  // data-sort-by values are properties in a single item of dataset
  constructor() {
    super();
    this.state = {
      name: 'name',
      marketCap: 'market_cap_',
      price: 'price_',
      availableSupply: 'available_supply',
      volume: '24h_volume_',
      percentChange_1Hour: 'percent_change_1h',
      percentChange_24Hours: 'percent_change_24h',
      percentChange_7Days: 'percent_change_7d',
    }
  }
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
      'Name': this.state.name,
      'Market Cap': this.state.marketCap,
      'Price': this.state.price,
      'Circulating Supply': this.state.availableSupply,
      'Volume(24h)': this.state.volume,
      '%1h': this.state.percentChange_1Hour,
      '%24h': this.state.percentChange_24Hours,
      '%7d': this.state.percentChange_7Days,
    };

    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="table-responsive">
            <table id="datatable-checkbox" className="table table-striped table-bordered bulk_action">
              <thead>
                <tr onClick={evt => this.props.sortTable(evt)} >
                  <th>
                    <i className="fa fa-check"></i>
                  </th>
                  <th>#</th>

                  { Object.keys(thElements).map(key => this.generateTH(thElements[key], key)) }
                  
                </tr>
              </thead>
              <tbody onClick={evt => this.props.onClickHandler(evt)}>
                {this.props.dataset.map((item, index) => (
                  <tr key={index}>
                    <td data-toggle="button">
                      <button 
                        className={`btn btn-xs btn-dark ${(!this.props.hashTable || !this.props.hashTable[item.id]) ? "" : "active"}`}
                        data-currency-id={item.id}
                      >
                        <span className="fa fa-check"></span>
                      </button>
                    </td>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item["market_cap_" + this.props.currency.toLowerCase()]}</td>
                    <td>{(+item["price_" + this.props.currency.toLowerCase()]).toFixed(5)}</td>
                    <td>{item.available_supply}</td>
                    <td>{item["24h_volume_" + this.props.currency.toLowerCase()]}</td>
                    <td>{item.percent_change_1h}</td>
                    <td>{item.percent_change_24h}</td>
                    <td>{item.percent_change_7d}</td>
                  </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}