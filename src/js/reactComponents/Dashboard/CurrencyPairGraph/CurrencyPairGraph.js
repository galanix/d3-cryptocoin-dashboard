import React from 'react';

import Header from '../../General/Header';
import Dropdown from '../../General/Dropdown';
import InputForm from '../../General/InputForm';
import ButtonGroup from '../../General/ButtonGroup';

const CurrencyPairGraph = () => (
    <div className="col-lg-6 col-md-12 col-sm-12 col-xs-12">                        
        <section id="currency-pair" className="row x_panel">
            <Header classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
                    titleText="Currency Pair"
            />
            <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="well dropdown-group">
                    <Dropdown classesCSS={{ button: 'btn-success', dropdown: "dropdown_currency" }}
                        titleText='Currency'
                        options={[
                            { dataValue:'BTCLTC', textValue: 'BTC - LTC' },
                            { dataValue:'LTCBTC', textValue: 'LTC - BTC' },
                            { dataValue:'ETHBTC', textValue: 'ETH - BTC' },
                            { dataValue:'BTCETH', textValue: 'BTC - ETH' },
                            { dataValue:'LTCETH', textValue: 'LTC - ETH' },
                            { dataValue:'ETHLTC', textValue: 'ETH - LTC' },
                        ]}
                    />
                    <Dropdown classesCSS={{ button: 'btn-success', dropdown: "dropdown_frequency" }}
                        titleText='Frequencies'
                        options={[
                            { dataValue:'1 min' },
                            { dataValue:'5 min' },
                            { dataValue:'30 mins' },
                            { dataValue:'1 hour' },
                            { dataValue:'3 hours' },
                            { dataValue:'6 hours' },
                            { dataValue:'12 hours' },
                            { dataValue:'24 hours' },
                        ]}
                    />                    
                </div>
                <InputForm formId="hours-input"
                           inputName="hours"
                           placeholder="Hours"
                           inputIcon="fa fa-clock-o"
                />
                <div className="well toggle-graphs">
                    <ButtonGroup containerAttrs={{ 'data-toggle': 'buttons'}}
                                 classesCSS="btn-group"
                                 buttons={[
                                    { classesCSS: 'btn-info active',
                                      id: "ask",
                                      textValue: [<span key="0" className="glyphicon glyphicon-ok"></span>]
                                    },
                                    { classesCSS: 'btn-danger active',
                                      id: "bid",
                                      textValue: [<span key="1" className="glyphicon glyphicon-ok"></span>]
                                    },
                                    { classesCSS: 'btn-success',
                                      id: "spread",
                                      textValue: [<span key="2" className="glyphicon glyphicon-ok"></span>]
                                    }
                                 ]}
                    />
                </div>
            </div>
            <div className="graph col-md-12 col-sm-12 col-xs-12"></div>
        </section>
    </div>
);
    
export default CurrencyPairGraph;