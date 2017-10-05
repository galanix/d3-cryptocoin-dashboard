import React from 'react';

import Header from '../../General/Header';
import CurrencyBlock from './CurrencyBlock';

const BitcoinCurrentPrice = () => (
    <div className="col-md-12 col-sm-12 col-xs-12">
        <section id="bitcoin-current-price" className="row tile_count x_panel">
            <Header classesCSS="col-md-6 col-sm-12 col-xs-12"
                    titleText="Current Price For Bitcoin"
            />

            <CurrencyBlock classesCSS="current-price-in-USD"
                            text="United States Dollars:"
            />

            <CurrencyBlock classesCSS="current-price-in-EUR"
                            text="European Union Euro:"
            />        
        </section>
    </div>
);
    
export default BitcoinCurrentPrice;