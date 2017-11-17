import React from "react";

import Header from "../../General/Header";
import ModalWindow from "./children/ModalWindow";
import Board from "./children/Board";

import { getRandomColor } from "../../../helperFunctions";

export default class CryptoBoard extends React.Component {
    constructor() {
      super();
      this.state = {};
      this.changeHashTableCurrency = this.changeHashTableCurrency.bind(this);
      this.toggleCheckbox = this.toggleCheckbox.bind(this);
      this.createURL = this.createURL.bind(this);
    }
    componentDidMount() {
        this.setState({
            hashTable: JSON.parse(window.localStorage.getItem("hashTable")) || {}
        }, () => {
            if(Object.keys(this.state.hashTable).length <= 1) this.ModalWindow.disableButton();
        });
    }
    toggleCheckbox(evt) { // add/removes data about the currency that user had selected in the table
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
            this.setState(prevState => ({ hashTable: Object.assign({}, prevState.hashTable, newItem) }), () => {
                saveHashTable();
                if(Object.keys(this.state.hashTable).length > 1) this.ModalWindow.enableButton();
            });
        } else {
            const newHashTable = Object.assign({}, this.state.hashTable);
            delete newHashTable[currencyId];
            this.setState(prevState => ({ hashTable: newHashTable }), () => {
                saveHashTable();
                if(Object.keys(this.state.hashTable).length <= 1) this.ModalWindow.disableButton();
            });
        }        
    }
    changeHashTableCurrency() {
      if(this.props.model.chart.filters.currency === this.props.model.table.filters.currency) { 
          return; // no need for changing data
      }
      
      // rewrite hashtable with the data that user has set and not the one that was in the table
      const newHashTable = {};
      for(let key in this.state.hashTable) {            
          const color = this.state.hashTable[key].color;
          newHashTable[key] = this.props.model.chart.data.find((item, id = key) => item.id === key);
          newHashTable[key].color = color;            
      }
      this.setState({
          hashTable: newHashTable
      });
    }    
    createURL(limit, currency) {
      let url = this.props.model.url + '?convert=' + currency;
      if(limit != '') {
        url += '&limit=' + limit;
      }      

      return url;      
    }    
    render() {        
      return  (
        <div className="col-md-12 col-sm-12 col-xs-12">
          <section id="board-of-crypto-currencies" className="row x_panel">
            <Header 
              classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
              titleText="Table of Currencies"
            />
            <ModalWindow 
              ref={mw => this.ModalWindow = mw}
              currentSign={this.props.signs[this.props.model.chart.filters.currency]}
              model={this.props.model.chart}
              limit={this.props.model.table.filters.limit}
              update={this.props.update}
              change={this.props.change}
              hashTable={this.state.hashTable}
              createURL={this.createURL}
              changeHashTableCurrency={this.changeHashTableCurrency}
            />
            <Board
              model={this.props.model.table}
              update={this.props.update}
              change={this.props.change}
              hashTable={this.state.hashTable}
              createURL={this.createURL}
              toggleCheckbox={this.toggleCheckbox}
            />
          </section>
        </div>
    );
  }
};