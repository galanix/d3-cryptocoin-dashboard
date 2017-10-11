import React from "react";

import Header from "../../General/Header";
import ModalWindow from "./ModalWindow";
import Filters from "./Filters";
import Table from "./Table";

class CryptoBoard extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {
        // const display = this.props.display;
        // const componentToUpdate = 'CryptoBoard';
        // this.props.update(this.createURL(), display, componentToUpdate)
        // .then(() => this.renderGraph(false));
    }
    render() {
        return  (
            <div className="col-md-12 col-sm-12 col-xs-12">                       
                <section id="board-of-crypto-currencies" className="row x_panel">
                    <Header classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
                            titleText="Table of Currencies"
                    />
                    <ModalWindow />
                    <Filters />
                    <Table />
                </section>
            </div>
        );
    }
}

export default CryptoBoard;