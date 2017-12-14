import React from 'react';
import PropTypes from 'prop-types';

import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

// COMPONENTS
import TopNav from './Navigation/TopNav';
import SideNav from './Navigation/SideNav';
import Dashboard from './Dashboard/Dashboard';
import Settings from './Settings/Settings';
import SavedGraphs from './SavedGraphs/SavedGraphs';

// EVENT DISPATCHERS
import {
  handleDataRequest,
  handleMultipleDataReqeuests,
} from '../reduxComponents/actions/update';

import filterChange from '../reduxComponents/actions/change';

// UI THEME EFFECTS
import templateScript from '../template'; // jQuery

// REDUX BOILIER PLATE
function mapStateToProps(state) {
  return {
    appData: state,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    update: (url, display, componentToUpdate) =>
      dispatch(handleDataRequest(url, display, componentToUpdate)),
    updateAll: (urls, componentToUpdate, createDataCollection) =>
      dispatch(handleMultipleDataReqeuests(urls, componentToUpdate, createDataCollection)),
    change: (newFilterValue, filterName, componentToUpdate) =>
      dispatch(filterChange(newFilterValue, filterName, componentToUpdate)),
  };
}

class App extends React.Component {
  componentDidMount() {
    templateScript();
  }
  componentWillMount() {
    this.setState({
      baseLocation: this.props.location.pathname,
    });

    this.update = this.props.update.bind(this);
    this.change = this.props.change.bind(this);
    this.updateAll = this.props.updateAll.bind(this);
  }
  render() {
    // routing
    const { baseLocation } = this.state;
    const mainPagePath = baseLocation;
    const settingsPagePath = `${baseLocation}settings`;
    const savedGraphsPagePath = `${baseLocation}saved_graphs`;

    return (
      <div className="main_container">
        <SideNav
          mainPagePath={mainPagePath}
          settingsPagePath={settingsPagePath}
          savedGraphsPagePath={savedGraphsPagePath}
        />
        <TopNav />
        <div className="right_col" role="main">
          <Switch>
            <Route
              exact
              path={mainPagePath}
              render={() => (
                <Dashboard
                  update={this.update}
                  change={this.change}
                  data={this.props.appData}
                />
              )}
            />
            <Route
              path={settingsPagePath}
              render={() => (
                <Settings
                  displayComponent={this.props.appData.Settings.displayComponent}
                  change={this.change}
                />
              )}
            />
            <Route
              path={savedGraphsPagePath}
              render={() => (
                <SavedGraphs
                  update={this.update}
                  updateAll={this.updateAll}
                  linkToGraphCreation={mainPagePath}
                  graphCollection={this.props.appData.SavedGraphs}
                  margin={this.props.appData.CryptoBoard.chart.margin}
                />
              )}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  update: PropTypes.func,
  change: PropTypes.func,
  updateAll: PropTypes.func,
  appData: PropTypes.object,
  location: PropTypes.object,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
