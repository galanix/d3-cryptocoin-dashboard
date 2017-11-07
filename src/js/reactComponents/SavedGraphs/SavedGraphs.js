import React from 'react';
import { Link } from 'react-router-dom';

import Chart from '../Dashboard/CryptoBoard/children/children/Chart.js';
import PopUp from './children/PopUp.js';

export default class SavedGraphs extends React.Component {
  constructor() {
      super(); 
      this.state = {
          componentToUpdate: 'SavedGraphs'
      }
  }
  componentDidMount() {
      console.log(this.props);
  }
  deleteChart(e) {
    const target = e.target;
    if(target.tagName !== 'SPAN') return;

    const index = Number(target.getAttribute('data-index'));
    const itemToDelete = this.props.graphCollection[index];

    console.log(index, itemToDelete);
    
    itemToDelete.actionType = 'delete';
    itemToDelete.index = index;
    
    this.props.update(null, this.state.componentToUpdate, itemToDelete);

  }
  render() {
    return (
      <section id="saved-graphs" className="row">
        { !!this.props.graphCollection && this.props.graphCollection.length !== 0 ?
          <div className="gallery col-md-8 col-md-offset-2" onClick={e => this.deleteChart(e)}>
            { this.props.graphCollection.map((item, index) => (
                <div className="x_panel" key={"graph-" + index}>
                  <span className="fa fa-times fa-2x" data-index={index}></span>
                  <Chart
                    hashTable={item.hashTable}
                    type={item.filters.type}
                    comparisionField={item.filters.comparisionField}
                    currentSign={item.currentSign}
                    immediateRender
                  />
                </div>
              )) 
            }
          </div>
          :
          <p>
            You currently have no saved graphs.
            <Link to={this.props.linkToGraphCreation}>Create one</Link>
          </p> 
        }       
      </section>
    );
  }
}