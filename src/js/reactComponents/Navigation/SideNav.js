import React from 'react';

import { Link } from 'react-router-dom';

const SideNav = () => (
<div className="col-md-3 left_col menu_fixed">
    <div className="left_col scroll-view">
        <div className="navbar nav_title" style={{border: "0"} }>
            <Link to="/" className="site_title">
                <i className="fa fa-line-chart"></i> 
                <span>D3 Dashboard</span>
            </Link>
        </div>
        <div className="clearfix"></div>
        <br />
        <div id="sidebar-menu" className="main_menu_side hidden-print main_menu">
            <div className="menu_section">
                <ul className="nav side-menu">
                    <li>
                        <a>
                            <i className="fa fa-bar-chart-o"></i> 
                            Dashboard
                            <span className="fa fa-chevron-down"></span>
                        </a>
                        <ul className="nav child_menu">
                            <li>
                                <a data-links_to="bitcoin-current-price">Current Bitcoin Price</a>
                            </li>
                            <li>
                                <a data-links_to="history">Bitcoin Price History</a>
                            </li>
                            <li>
                                <a data-links_to="currency-pair">Currency Comparison</a>
                            </li>
                            <li>
                                <a data-links_to="board-of-crypto-currencies">Table of Currencies</a>
                            </li>                                    
                        </ul>
                    </li>
                    <li>
                        <a>
                            <i className="fa fa-cogs"></i>
                            Settings
                            <span className="fa fa-chevron-down"></span>                                        
                        </a>                                    
                        <ul className="nav child_menu">
                            <li>
                                <Link to="/settings">Components</Link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>        
        </div>                
    </div>
</div>
);

export default SideNav;