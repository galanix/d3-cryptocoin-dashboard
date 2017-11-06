import React from "react";

import Checkbox from "./children/Checkbox";

export default class Settings extends React.Component {
  constructor() {
    super();
    this.onClickHandler = this.onClickHandler.bind(this);
  }
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
    if(target.tagName === "DIV") {
        return;
    } else if(target.tagName === "SPAN") {
      target = target.parentElement.childNodes[0];
    } else if(target.tagName === "I") {
      target = target.parentElement;
    }

    const key = target.getAttribute("data-component_name");
    const filterName = "displayComponent";
    const newFilterValue = Object.assign({}, this.props.displayComponent);

    newFilterValue[key] = !this.props.displayComponent[key];

    this.props.change(newFilterValue, filterName, this.state.componentToUpdate);
    window.localStorage.setItem(filterName, JSON.stringify(newFilterValue));
    this.applyChanges(target, newFilterValue[key]);
  }
  applyChanges(target, value) {
    if(value) {
      target.className = "btn btn-lg btn-success";
      target.querySelector("i").className = "fa fa-check";
    } else {
      target.className = "btn btn-lg btn-danger";
      target.querySelector("i").className = "fa fa-times";
    }
  }
  render() {
    return (
      <div className="right_col" role="main">
        <section id="component-display" className="row" ref={section => this.checkboxSection = section}>
          <Checkbox componentName="BitcoinCurrentPrice"
                    title="Current Bitcoin Price"
                    onClickHandler={this.onClickHandler}
          />
          <Checkbox componentName="BitcoinHistoryGraph" 
                    title="Bitcoin Price History" 
                    onClickHandler={this.onClickHandler}
          />
          <Checkbox componentName="CurrencyPairGraph"
                    title="Currency Comparison"
                    onClickHandler={this.onClickHandler}
          />
          <Checkbox componentName="CryptoBoard"
                    title="Table of Currencies"
                    onClickHandler={this.onClickHandler}
          />
        </section>
      </div>
    );      
  }
};