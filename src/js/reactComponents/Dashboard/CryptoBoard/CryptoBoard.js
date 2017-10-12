import React from "react";

import Header from "../../General/Header";
import ChartModalWindow from "./ChartModalWindow";
import Board from "./Board";

const CryptoBoard = props => {
    return  (
        <div className="col-md-12 col-sm-12 col-xs-12">
            <section id="board-of-crypto-currencies" className="row x_panel">
                <Header classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
                        titleText="Table of Currencies"
                />
                <ChartModalWindow model={props.model.chart}
                                  url={props.model.url}
                                  update={props.update}
                                  change={props.change}
                                  display={props.display}
                />
                <Board model={props.model.table}
                       url={props.model.url}
                       update={props.update}
                       change={props.change}
                       display={props.display}
                />
            </section>
        </div>
    );    
}

export default CryptoBoard;