import React from 'react';

const CurrencyBlock = props => (
    <div className={`${props.classesCSS} col-md-3 col-sm-6 col-xs-6 tile_stats_count`}>
        <span className="count_top">{props.text}</span>
        <div className="count"></div>
        <span className="count_bottom">
            <i className="green"></i>
        </span>
    </div>
);

export default CurrencyBlock;