import React from 'react';

import { Link } from 'react-router-dom';

class SideNav extends React.Component {
    onClickHandler(evt, duration = 200) {
        if(this.props.location !== "/") return;

        const destination = document.getElementById(evt.target.getAttribute("data-links-to"));
        if(!destination) return;
        const easingFunc = t =>  t * (2 - t);
        const scroll = () => {
            const now = "now" in window.performance ? performance.now() : new Date().getTime();
            const time = Math.min(1, ((now - startTime) / duration));
            const timeFunction = easingFunc(time);
            window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));    
            if (window.pageYOffset === destinationOffsetToScroll) {            
                return;
            }    
            requestAnimationFrame(scroll);
        };
    
        const start = window.pageYOffset;
        const startTime = "now" in window.performance ? performance.now() : new Date().getTime();
    
        const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName("body")[0].clientHeight;
        
        let destinationOffset = destination.getBoundingClientRect().top;
        if(destinationOffset < 0) destinationOffset = destination.offsetTop;        

        const destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
        if ("requestAnimationFrame" in window === false) {
            window.scroll(0, destinationOffsetToScroll);        
            return;
        }
    
        scroll();
    }
    render() {
        return (
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
                                            <Link to="/" onClick={evt => this.onClickHandler(evt, 300)} data-links-to="bitcoin-current-price">Current Bitcoin Price</Link>
                                        </li>
                                        <li>
                                            <Link to="/" onClick={evt => this.onClickHandler(evt, 300)} data-links-to="history">Bitcoin Price History</Link>
                                        </li>
                                        <li>
                                            <Link to="/" onClick={evt => this.onClickHandler(evt, 300)} data-links-to="currency-pair">Currency Comparison</Link>
                                        </li>
                                        <li>
                                            <Link to="/" onClick={evt => this.onClickHandler(evt, 300)} data-links-to="board-of-crypto-currencies">Table of Currencies</Link>
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
    }
};

export default SideNav;