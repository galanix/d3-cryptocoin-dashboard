import React from "react";

import Header from "../../General/Header";
import ModalWindow from "./ModalWindow";
import Board from "./Board";

import { getRandomColor } from "../../../helperFunctions";

export default class CryptoBoard extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    componentDidMount() {
        this.setState({
            hashTable: JSON.parse(window.localStorage.getItem("hashTable")) || {}
        });
    }
    toggleCheckbox(evt) {
        let target = evt.target;
        if(target.tagName !== "BUTTON") {
            if(target.tagName === "SPAN") target = target.parentElement;
            else return;
        }
        
        const currencyId = target.getAttribute("data-currency-id");
        const checked =  target.classList.contains("active");
        const saveHashTable = () => window.localStorage.setItem("hashTable", JSON.stringify(this.state.hashTable));    
        
        if(checked) {
            const newItem =  {
                [currencyId]: Object.assign({},
                    this.props.model.table.data.find((item, id = currencyId) => item.id === currencyId),
                    { color : getRandomColor() }
                )
            };
            this.setState(prevState => ({ hashTable: Object.assign({}, prevState.hashTable, newItem) }), saveHashTable);
        } else {
            const newHashTable = Object.assign({}, this.state.hashTable);
            delete newHashTable[currencyId];

            this.setState(prevState => ({ hashTable: newHashTable }), saveHashTable);
        }

        // check for modal window's state
    }
    render() {
        return  (
            <div className="col-md-12 col-sm-12 col-xs-12">
                <section id="board-of-crypto-currencies" className="row x_panel">
                    <Header classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
                            titleText="Table of Currencies"
                    />
                    <ModalWindow model={this.props.model.chart}
                                 url={this.props.model.url}
                                 update={this.props.update}
                                 change={this.props.change}
                                 display={this.props.display}
                                 hashTable={this.state.hashTable}
                    />
                    <Board model={this.props.model.table}
                           url={this.props.model.url}
                           update={this.props.update}
                           change={this.props.change}
                           display={this.props.display}
                           hashTable={this.state.hashTable}
                           toggleCheckbox={this.toggleCheckbox.bind(this)}
                    />
                </section>
            </div>
        );
    }
};