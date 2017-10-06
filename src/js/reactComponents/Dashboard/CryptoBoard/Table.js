import React from "react";

const Table = () => (
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
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
);

export default Table;