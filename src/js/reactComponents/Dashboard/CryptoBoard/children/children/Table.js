import React from "react";

export default function Table(props) {
  // data-sort-by values are properties in a single item of dataset
  return (
    <div className="row">
      <div className="col-xs-12">
        <div className="table-responsive">
          <table id="datatable-checkbox" className="table table-striped table-bordered bulk_action">
            <thead>
              <tr onClick={evt => props.sortTable(evt)} >
                <th>
                  <i className="fa fa-check"></i>
                </th>
                <th>#</th>
                <th data-sort-by="name">Name</th>
                <th data-sort-by="market_cap">Market Cap</th>
                <th data-sort-by="price">Price</th>
                <th data-sort-by="available_supply">Circulating Supply</th>
                <th data-sort-by="24h_volume">Volume(24h)</th>
                <th data-sort-by="percent_change_1h">%1h</th>
                <th data-sort-by="percent_change_24h">%24h</th>
                <th data-sort-by="percent_change_7d">%7d</th>
              </tr>
            </thead>
            <tbody onClick={evt => props.onClickHandler(evt)}>
              {props.dataset.map((item, index) => (
                <tr key={index}>
                  <td data-toggle="button">
                    <button 
                      className={`btn btn-xs btn-dark ${(!props.hashTable || !props.hashTable[item.id]) ? '' : 'active'}`}
                      data-currency-id={item.id}
                    >
                      <span className="fa fa-check"></span>
                    </button>
                  </td>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item["market_cap_" + props.currency.toLowerCase()]}</td>
                  <td>{(+item["price_" + props.currency.toLowerCase()]).toFixed(5)}</td>
                  <td>{item.available_supply}</td>
                  <td>{item["24h_volume_" + props.currency.toLowerCase()]}</td>
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