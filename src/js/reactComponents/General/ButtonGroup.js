import React from 'react';

class ButtonGroup extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {        
        this.setState({
            prevClickedBtn: this.container.querySelector('.active')
        });           
    }
    handleClick(e) {
        const target = e.target;
        if(
            target.tagName !== 'BUTTON' ||
            target === this.state.prevClickedBtn
        ) return;
        
        this.state.prevClickedBtn.classList.remove('active');    
        this.setState({
            prevClickedBtn: target
        }, () => this.state.prevClickedBtn.classList.add('active'));

        this.props.onClickHandler(target);
    }
    render() {
        return (
            <div ref={div => this.container = div}
                 className={this.props.classesCSS} 
                 onClick={e => this.handleClick(e)}
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