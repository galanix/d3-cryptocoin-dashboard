import React from "react";

import Header from "../../General/Header";
import ModalWindow from "./ModalWindow";
import Filters from "./Filters";
import Table from "./Table";

const CryptoBoard = () => (
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

export default CryptoBoard;