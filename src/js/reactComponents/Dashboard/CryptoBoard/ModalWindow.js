import React from "react";

import Dropdown from "../../General/Dropdown";
import ButtonGroup from "../../General/ButtonGroup";
import Chart from "./Chart";

import { changeCSSProperties } from "../../../helperFunctions";

export default class ModalWindow extends React.Component {
    constructor() {
        super();
        this.state = {
            componentToUpdate: "CryptoBoard_chart",
            propertiesCSS: [ "paddingTop", "PaddingBottom", "maxHeight", "minHeight" ],
            buttonIsDisabled: false,
        };
    }
    componentDidMount() {
        window.addEventListener("resize", this.scaleChart.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.scaleChart.bind(this));
    }
    scaleChart() {
        console.log("window resized");
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
    toggleButton() {
        this.setState(prevState => ({
            buttonIsDisabled: !prevState.buttonIsDisabled
        }));
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

          this.props.update(this.props.createURL(this.props.limit, newFilterValues[0]), this.props.display, this.state.componentToUpdate)
            .then(() => {
                this.props.change(newFilterValues, filterNames, this.state.componentToUpdate);
                this.props.changeHashTableCurrency();
            });
          
        }
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
                                        buttons={[
                                            { classCSS:"active", textValue: "Price" },
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
                                        buttons={[
                                            { attrs: { "data-type": "bar"}, textValue: "Price" },
                                            { attrs: { "data-type": "pie"}, textValue: "Volume(24h)" },
                                            { attrs: { "data-type": "pie-donut"}, textValue: "Market Cap" },                                    
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
                                    { classesCSS: "btn-success", id: "build-button", textValue: "Build Chart" }
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