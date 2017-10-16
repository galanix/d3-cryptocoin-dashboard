import React from "react";

import Dropdown from "../../../General/Dropdown";
import ButtonGroup from "../../../General/ButtonGroup";
import Chart from "./children/Chart";

import { changeCSSProperties } from "../../../../helperFunctions";

export default class ModalWindow extends React.Component {
    constructor() {
        super();
        this.state = {
            componentToUpdate: "CryptoBoard_chart",
            propertiesCSS: [ "paddingTop", "PaddingBottom", "maxHeight", "minHeight" ],
            buttonIsDisabled: false,
        };
    }
    openModalWindow() {
        if(this.state.buttonIsDisabled) return;
        const values = [ "19px", "19px", "2000px", "20px" ];
        changeCSSProperties(this.state.propertiesCSS, values, this.modalWindow);
    }
    closeModalWindow() {
        const values = [ "0", "0", "0", "0" ];
        changeCSSProperties(this.state.propertiesCSS, values, this.modalWindow);
    }
    enableButton() {
        this.setState({
            buttonIsDisabled: false
        });
    }
    disableButton() {
        this.setState({
            buttonIsDisabled: true
        });
    }
    visualize() {
        if(this.state.buttonIsDisabled) return;

        const { type, comparisionField } = this.props.model.filters;        
        this.chart.renderChart(type, comparisionField);
    }
    changeCurrencyFilter(target) {
        const filterNames = [ "currency" ];
        const newFilterValues = [ target.getAttribute("data-value") ];
        const comparisionField = this.props.model.filters.comparisionField;
        
        if(this.props.model.filters.currency !== newFilterValues[0]) {            
          if(
            comparisionField.indexOf("price") !== -1 ||
            comparisionField.indexOf("volume_24h") !== -1 ||
            comparisionField.indexOf("market_cap") !== -1
          ) {
            // we need to change the last three chars as they represent currency
            filterNames.push("comparisionField");
            newFilterValues.push(comparisionField.substr(0, comparisionField.length - 3) + newFilterValues[0].toLowerCase());            
          }

          this.props.update(this.props.createURL(this.props.limit, newFilterValues[0]), this.state.componentToUpdate)
            .then(() => {
                this.props.change(newFilterValues, filterNames, this.state.componentToUpdate);
                this.props.changeHashTableCurrency();
            });
          
        }
    }
    changeComparisionField(target) {
        const btnVal = target.textContent;
        const currency = this.props.model.filters.currency;
        const filterName = "comparisionField";
        let newFilterValue;
        
        switch(btnVal) {
          case "Price":
            newFilterValue = "price_" + currency.toLowerCase();
            break;
          case "Volume(24h)":
            newFilterValue = "24h_volume_" + currency.toLowerCase();
            break;
          case "Market Cap":
            newFilterValue = "market_cap_" + currency.toLowerCase();
            break;
          case "%1h":
            newFilterValue = "percent_change_1h";
            break;
          case "%24h":
            newFilterValue = "percent_change_24h";
            break;
          case "%7d":
            newFilterValue = "percent_change_7d";
            break;
        }

        this.props.change(newFilterValue, filterName, this.state.componentToUpdate);
    }
    changeChartType(target) {
        const filterName = "type";
        const newFilterValue = target.getAttribute("data-type");
        this.props.change(newFilterValue, filterName, this.state.componentToUpdate);
    }
    render() {
        return (
            <div>
                <button id="modal-button"
                        className={`btn ${this.state.buttonIsDisabled ? 'disabled' : ''}`}
                        onClick={this.openModalWindow.bind(this)}
                >
                    Visualize
                </button>
                <section ref={section => this.modalWindow = section} className="modal-window col-md-12 col-sm-12 col-xs-12">
                    <div className="well">
                        <Dropdown classesCSS={{ dropdown: "dropdown_chart-currency", button: "btn-success" }}
                                  defaultDataValue={this.props.model.filters.currency}
                                  onClickHandler={this.changeCurrencyFilter.bind(this)}
                                  titleText="Currency"
                                  options={[
                                      { dataValue: "USD" },
                                      { dataValue: "EUR" },
                                      { dataValue: "UAH" },
                                      { dataValue: "RUB" },
                                      { dataValue: "BTC" },
                                      { dataValue: "LTC" },
                                      { dataValue: "ETH" }
                                  ]}
                        />
                        <div className="btn-group_container">
                            <h4>Categories</h4>
                            <ButtonGroup classesCSS="btn-group category"
                                         onClickHandler={this.changeComparisionField.bind(this)}
                                         buttons={[
                                            { classesCSS:"active", textValue: "Price" },
                                            { textValue: "Volume(24h)" },
                                            { textValue: "Market Cap" },
                                            { textValue: "%1h" },
                                            { textValue: "%24h" },
                                            { textValue: "%7d" }
                                         ]}
                            />
                        </div>
                        <div className="btn-group_container">
                            <h4>Graph Types</h4>
                            <ButtonGroup classesCSS="btn-group type"
                                         onClickHandler={this.changeChartType.bind(this)}
                                         buttons={[
                                            { classesCSS: "active", attrs: { "data-type": "bar"}, textValue: "Bar" },
                                            { attrs: { "data-type": "pie"}, textValue: "Pie" },
                                            { attrs: { "data-type": "pie-donut"}, textValue: "Donut" },
                                         ]}
                            />
                        </div>
                    </div>
                    <ButtonGroup classesCSS="controll-group"
                                 onClickHandler = {(target) => {
                                    if(target.getAttribute("id") === "cancel-button") this.closeModalWindow();
                                    else this.visualize();
                                 }}
                                 buttons={[
                                    { classesCSS: "btn-danger", id:"cancel-button", textValue: "Hide" },
                                    { classesCSS: `btn-success  ${this.state.buttonIsDisabled ? 'disabled' : ''}`, id: "build-button", textValue: "Build Chart" }
                                 ]}
                    
                    />
                    <Chart ref={chart => this.chart = chart}
                           hashTable={this.props.hashTable}
                    />
                </section>
            </div>
        );
    }
};