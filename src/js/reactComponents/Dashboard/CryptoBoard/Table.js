import React from "react";

export default class Table extends React.Component {
    render() {        
        return (
            <div className="row">
                <div className="col-xs-12">
                    <div className="table-responsive">
                        <table id="datatable-checkbox" className="table table-striped table-bordered bulk_action">
                            <thead>
                                <tr>
                                    <th>Check</th>
                                    <th>#</th>
                                    <th>Name</th>                    
                                    <th>Market Cap</th>
                                    <th>Price</th>
                                    <th>Circulating Supply</th>
                                    <th>Volume(24h)</th>
                                    <th>%1h</th>
                                    <th>%24h</th>
                                    <th>%7d</th>
                                </tr>
                            </thead>                                                        
                            <tbody>
                                {this.props.dataset.map((item, index) => (
                                    <tr key={index}>
                                        <td data-toggle="button">
                                            <button className="btn btn-xs btn-dark" 
                                                    data-index={item.index}
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
};