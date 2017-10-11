import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import TopNav from './Navigation/TopNav';
import SideNav from './Navigation/SideNav';
import Dashboard from './Dashboard/Dashboard';
import Settings from './Settings/Settings';

import { dataRequest, filterChange } from "../reduxComponents/actions/update"


class App extends React.Component {
    render() {
        return (
            <div className="main_container">
                <SideNav />
                <TopNav />
                <Switch>
                    <Route exact path="/"
                           render={props => (
                               <Dashboard update={this.props.update.bind(this)} 
                                          change={this.props.change.bind(this)}
                                          data={this.props.appData} 
                                />
                           )}
                    />
                    <Route path="/settings" component={Settings} />
                </Switch>
            </div>
        );
    }
};

const mapStateToProps = state => ({
    appData: state
});

const mapDispatchToProps = dispatch => ({
    update: (url, display, componentToUpdate) => dispatch(dataRequest(url, display, componentToUpdate)),
    change: (newFilterValue, filterName, componentToUpdate) => dispatch(filterChange(newFilterValue, filterName, componentToUpdate))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);