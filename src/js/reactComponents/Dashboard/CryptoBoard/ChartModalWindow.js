import React from "react";

import Dropdown from "../../General/Dropdown";
import ButtonGroup from "../../General/ButtonGroup";

export default class ChartModalWindow extends React.Component {
    constructor() {
        super();
        this.state = {
            componentToUpdate: "CryptoBoard_chart"
        };
    }
    componentDidMount() {
        window.addEventListener("resize", this.scaleChart.bind(this));

        // this.props.update(this.createURL(), this.props.display, this.state.componentToUpdate);
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.scaleChart.bind(this));
    }
    scaleChart() {
        console.log("window resized");
    }
    render() {
        return (
            <div>
                <button id="modal-button" className="btn">Visualize</button>
                <section className="modal-window col-md-12 col-sm-12 col-xs-12">
                    <div className="well">
                        <Dropdown classesCSS={{ dropdown: "dropdown_chart-currency", button: "btn-success" }}
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
                                buttons={[
                                    { classesCSS: "btn-danger", id:"cancel-button", textValue: "Hide" },
                                    { id: "build-button", textValue: "Build Chart" }
                                ]}                         
                    
                    />
                    <div className="graph"></div>
                </section>
            </div>
        );
    }
};