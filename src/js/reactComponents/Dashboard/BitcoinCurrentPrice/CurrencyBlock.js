import React from "react";

class CurrencyBlock extends React.Component {
    constructor() {
        super();
        this.state = {
            blink: false,
            transition: "all .5s ease-in",
            highlightColor: "#26B99A",
            blackColor: "#73879C"
        }
    }
    componentWillReceiveProps() {
        this.setState({
            blink: true
        }, () => {
            setTimeout(() => this.setState({
                blink: false
            }), 3000);
        })
    }
    render() {
        return  (
            <div className={`${this.props.classesCSS} col-md-3 col-sm-6 col-xs-6 tile_stats_count`}>
                <span className="count_top">{this.props.text}</span>
                <div className={`count ${this.state.blink ? 'blinking' : ''}`}  dangerouslySetInnerHTML={{__html: this.props.sign + this.props.currencyValue}}></div>
                <span className="count_bottom">
                    {this.props.renderDifference()}
                </span>
            </div>
        );
    }
}

export default CurrencyBlock;