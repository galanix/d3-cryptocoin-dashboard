import React from 'react';
import { Link } from 'react-router-dom';

import Chart from '../Dashboard/CryptoBoard/children/children/Chart.js';
import PopUp from '../General/PopUp.js';

export default class SavedGraphs extends React.Component {
  constructor() {
    super();
    this.state = {
        componentToUpdate: 'SavedGraphs',        
        popUpId: "pop-up",        
    }
    this.confirmDeletion = this.confirmDeletion.bind(this);    
    this.selectChartForDeletion = this.selectChartForDeletion.bind(this);
  }
  componentDidMount() {
    this.updateGraphCollectionData();
  }
  confirmDeletion(e) {
    const target = e.target;
    if(target.tagName !== 'BUTTON') return;

    const outcome = e.target.getAttribute('data-variant');

    switch(outcome) {
      case 'confirm':
        this.deleteChart();
        break;

      case 'cancel':
        this.setState({ target: null });
        break;

      default:
        console.warn('outcome switch defaulted with', outcome);
    }
  }
  updateGraphCollectionData() {    
    const graphCollection = this.props.graphCollection;    

    if(graphCollection.length === 0) {
      return;
    }

    // this is done to make only one request per same url
    /*
     {
       [url]: [ ...datasetsThatHaveThisURL ]
     },
    */

    const updateDataset = {};
    graphCollection.forEach(item => {
      if(!updateDataset[item.url]) {
        updateDataset[item.url] = [];
      }
      updateDataset[item.url].push(item);
    });

    const urls = Object.keys(updateDataset);

    this.props.updateAll(urls, this.state.componentToUpdate, this.createDataCollection(urls, updateDataset));    
  }
  createDataCollection(urls, updateDataset) {
    const newGraphCollection = [];
      return results => {
        urls.forEach((url, index) => {
        // iterate over unique urls
        updateDataset[url].forEach(item => { // each url is mapped to an array of datasets that depend on it for data :
          /*
          {
            [url]: [ ...datasets ]
          },
          */
          // iterate over datasets arrays
          const ids = Object.keys(item.hashTable); // each dataset item is an array of objects { id: {...properties} }
          const newGraphItem = JSON.parse(JSON.stringify(item));

          ids.forEach(id => { // iterate over ids
            newGraphItem.hashTable[id] = results[index].find(d => d.id === id);
            // results do not have color props, we need to take them from old data
            newGraphItem.hashTable[id].color = item.hashTable[id].color;
          });
          newGraphCollection.push(newGraphItem);
        });                       
      });
      return newGraphCollection;
    }

  }
  selectChartForDeletion(e) {
    const target = e.target;
    if(target.tagName !== 'SPAN') return;

    this.setState({ target });
  }
  deleteChart() {
    const target = this.state.target;
    
    if(!target) return;

    const id = target.getAttribute('data-id');
    const index = this.props.graphCollection.reduce((res, item, index) => {
      if(item.id === id) {
        res = index;
      }
      return res;
    });

    // faking an item of graphCollection to prevent from searching 2 times
    // reducers.js only needs to know the index of an element for deletion
    const itemToDelete = {
      index,
      actionSubtype: 'delete',
    };
    
    this.props.update(null, this.state.componentToUpdate, itemToDelete);
  }
  render() {
    const popUpId = this.state.popUpId;    
    return (
      <section id="saved-graphs" className="row">
        <PopUp
          id={popUpId}
          headerText="Confirm Deletion"
          bodyText="Are you sure want to delete this chart item?"
          confirmAction={this.confirmDeletion}
        />
        { !!this.props.graphCollection && this.props.graphCollection.length !== 0 ?
          <div className="gallery col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3" onClick={this.selectChartForDeletion}>
            { this.props.graphCollection.map(item => (
                <div className="x_panel" key={item.id}>
                  <span
                    className="fa fa-times fa-2x"
                    data-id={item.id}
                    data-toggle="modal"
                    data-target={"#" + popUpId}
                  >
                  </span>
                  <Chart
                    hashTable={item.hashTable}
                    type={item.filters.type}
                    comparisionField={item.filters.comparisionField}
                    currentSign={item.currentSign}
                    margin={this.props.margin}
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