import React from "react";

import Checkbox from "./Checkbox";

export default class Settings extends React.Component {
    componentDidMount() {
        this.checkboxSection.querySelectorAll("button").forEach(button => this.applyChanges(
            button,
            this.props.displayComponent[button.getAttribute("data-component_name")]
        ));
        this.setState({
            componentToUpdate: "Settings"
        });
    }
    onClickHandler(evt) {
        let target = evt.target;
        if(target.tagName === "DIV") return;
        if(target.tagName === "SPAN") target = target.parentElement;

        const key = target.getAttribute("data-component_name");
        const filterName = "displayComponent";
        const newFilterValue = Object.assign({}, this.props.displayComponent);
        newFilterValue[key] = !this.props.displayComponent[key];

        this.props.change(newFilterValue, filterName, this.state.componentToUpdate);
        window.localStorage.setItem("displayComponent", JSON.stringify(newFilterValue));        
        this.applyChanges(target, newFilterValue[key]);
    }
    applyChanges(target, value) {
        if(value) {
            target.className = "btn btn-lg btn-success";
            target.getElementsByTagName("span")[0].className = "fa fa-check";
        } else {
            target.className = "btn btn-lg btn-danger";
            target.getElementsByTagName("span")[0].className = "fa fa-times";
        }
    }
    render() {
        return (
            <div className="right_col" role="main">
                <section id="component-display" className="row" ref={section => this.checkboxSection = section}>
                    <Checkbox componentName="BitcoinCurrentPrice"
                              title="Current Bitcoin Price"
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                    <Checkbox componentName="BitcoinHistoryGraph" 
                              title="Bitcoin Price History" 
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                    <Checkbox componentName="CurrencyPairGraph"
                              title="Currency Comparison"
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                    <Checkbox componentName="CryptoBoard"
                              title="Table of Currencies"
                              onClickHandler={this.onClickHandler.bind(this)}
                    />
                </section>
            </div>
        );      
    }
};