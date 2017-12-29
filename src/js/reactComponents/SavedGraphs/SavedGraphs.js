import React from 'react';
import { Link } from 'react-router-dom';

import Chart from '../Dashboard/CryptoBoard/children/children/Chart.js';
import PopUp from '../General/PopUp.js';

export default class SavedGraphs extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'SavedGraphs',
      popUpId: 'pop-up',
    };
    this.confirmDeletion = this.confirmDeletion.bind(this);
    this.selectChartForDeletion = this.selectChartForDeletion.bind(this);
  }
  componentDidMount() {
    // this.updateGraphCollectionData();
  }
  confirmDeletion(e) {
    const { target } = e;
    if (target.tagName !== 'BUTTON') return;

    const outcome = e.target.getAttribute('data-variant');

    switch (outcome) {
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
    // collection of objects that are used to build graphs
    // each is enough to build a graph
    const { graphCollection } = this.props;

    if (graphCollection.length === 0) {
      return;
    }

    const urlsToDatasetsHash = {};
    graphCollection.forEach((item) => {
      if (!urlsToDatasetsHash[item.url]) {
        urlsToDatasetsHash[item.url] = [];
      }
      urlsToDatasetsHash[item.url].push(item);
    });

    // urls to dataset hash
    // this is done to make only one request per same url
    /*
     {
       [url]: [ ...datasetsThatHaveThisURL ]
     },
    */

    const urls = Object.keys(urlsToDatasetsHash);

    this.props.updateAll(
      urls,
      this.state.componentToUpdate,
      this.createDataCollection(urls, urlsToDatasetsHash),
    );
  }
  createDataCollection(urls, urlsToDatasetsHash) {
    const newGraphCollection = [];
    return (results) => {
      urls.forEach((url, index) => {
      // iterate over unique urls
        urlsToDatasetsHash[url].forEach((item) => {
          // each url is mapped to an array of datasets that depend on it for data :
          /*
          {
            [url]: [ ...datasets ]
          },
          */
          // iterate over datasets arrays
          const ids = Object.keys(item.hashTable);
          // each dataset item is an array of objects { id: {...properties} }
          const newGraphItem = JSON.parse(JSON.stringify(item));

          ids.forEach((id) => { // iterate over ids
            newGraphItem.hashTable[id] = results[index].find(d => d.id === id);
            // results do not have color props, we need to take them from old data
            newGraphItem.hashTable[id].color = item.hashTable[id].color;
          });
          newGraphCollection.push(newGraphItem);
        });
      });
      return newGraphCollection;
    };
  }
  selectChartForDeletion(e) {
    const { target } = e;
    if (target.tagName !== 'SPAN') return;

    this.setState({ target });
  }
  deleteChart() {
    const { target } = this.state;

    if (!target) return;

    const id = target.getAttribute('data-id');
    // reduce is an array method!
    const index = this.props.graphCollection.reduce((res, item, idx) => {
      return (item.id === id) ? idx : res;
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
    const { popUpId } = this.state;
    return (
      <section id="saved-graphs" className="row">
        <PopUp
          id={popUpId}
          headerText="Confirm Deletion"
          bodyText="Are you sure want to delete this chart item?"
          confirmAction={this.confirmDeletion}
        />
        { !!this.props.graphCollection && this.props.graphCollection.length !== 0 ?
          <div
            className="gallery col-xs-12 col-sm-8 col-sm-offset-2 col-md-8 col-md-offset-"
            onClick={this.selectChartForDeletion}
          >
            <h1 className="component-main-title">Saved Graphs</h1>
            { this.props.graphCollection.map(item => (
              <div className="x_panel" key={item.id}>
                <span
                  className="fa fa-times fa-2x"
                  data-id={item.id}
                  data-toggle="modal"
                  data-target={`#${popUpId}`}
                />
                <div className="graph-container">
                  <Chart
                    hashTable={item.hashTable}
                    type={item.filters.type}
                    comparisionField={item.filters.comparisionField}
                    currentSign={item.currentSign}
                    url={item.url}
                    margin={this.props.margin}
                    immediateRender
                  />
                </div>
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