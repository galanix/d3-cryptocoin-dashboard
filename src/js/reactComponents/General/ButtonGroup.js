import React from 'react';

class ButtonGroup extends React.Component {
    constructor() {
        super();
        this.state = { 
            prevClickedBtn: null
        };
    }
    componentDidMount() {
        if(this.props.noSingleButtonSelection) return;

        this.setState({
            prevClickedBtn: this.container.querySelector('.active')
        });
    }
    handleClick(evt) {
        const target = evt.target;
        if(target === this.state.prevClickedBtn) return;

        if(!!this.state.prevClickedBtn) {
            this.state.prevClickedBtn.classList.remove('active');
            this.setState({
                prevClickedBtn: target
            }, () => this.state.prevClickedBtn.classList.add('active'));
        }

        this.props.onClickHandler(target);
    }
    render() {
        return (
            <div ref={div => this.container = div}
                 className={this.props.classesCSS}
                 onClick={evt => this.handleClick(evt)}
                 {...this.props.containerAttrs}
            >
                {this.props.buttons.map((btn, index) => (
                    <button key={index} {...btn.attrs } 
                            className={`btn ${btn.classesCSS}`}
                            id={btn.id}>{btn.textValue}                    
                    </button>
                ))}
            </div>
        );
    }
}

export default ButtonGroup;