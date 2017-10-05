import React from 'react';

import Header from '../../General/Header';
import Dropdown from '../../General/Dropdown';


const CurrencyPairGraph = () => (
    <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">                        
        <section id="currency-pair" class="row x_panel">
            <Header classesCSS="col-md-12 col-sm-12 col-xs-12 x_title"
                    titleText="Currency Pair"
            />
            

            <div class="col-md-12 col-sm-12 col-xs-12">
                <div class="well dropdown-group">
                    <Dropdown classesCSS={{ btn: 'btn-success' }}
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
                    <Dropdown classesCSS={{ btn: 'btn-success' }}
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
                    
                    <div class="dropdown_container">
                        <h4>Frequencies</h4>
                        <div class="dropdown dropdown_frequency">                                        
                            <button class="btn btn-success dropdown-toggle" type="button" data-toggle="dropdown">
                                <span></span>    
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a data-value="1 min">1 min</a></li>
                                <li><a data-value="5 mins">5 min</a></li>
                                <li><a data-value="10 mins">10 mins</a></li>
                                <li><a data-value="30 mins">30 mins</a></li>
                                <li><a data-value="1 hour">1 hour</a></li>
                                <li><a data-value="3 hours">3 hours</a></li>
                                <li><a data-value="6 hours">6 hours</a></li>
                                <li><a data-value="12 hours">12 hours</a></li>
                                <li><a data-value="24 hours">24 hours</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <form class="well form-horizontal form-label-left input_mask" id="hours-input">
                    <div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback">
                        <input name="hours" type="text" class="form-control has-feedback-left" placeholder="Hours" />
                        <span class="fa fa-clock-o form-control-feedback left" aria-hidden="true"></span>
                    </div>
                </form>
                
                <div class="well toggle-graphs">                                    
                    <div class="btn-group" data-toggle="buttons">
                    <label class="btn btn-info active" id="ask">
                        <input type="checkbox" autocomplete="off" />
                        <span class="glyphicon glyphicon-ok"></span>
                    </label>
                    <label class="btn btn-danger active" id="bid">
                        <input type="checkbox" autocomplete="off" />
                        <span class="glyphicon glyphicon-ok"></span>
                    </label>
                    <label class="btn btn-success" id="spread" >
                        <input type="checkbox" autocomplete="off" />
                        <span class="glyphicon glyphicon-ok"></span>
                    </label>
                    </div>
                </div>

            </div>
            <div class="graph col-md-12 col-sm-12 col-xs-12"></div>
        </section>                        
    </div>
);
    
export default CurrencyPairGraph;