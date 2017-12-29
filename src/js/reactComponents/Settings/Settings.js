import React from 'react';

import ComponentsToDisplay from './children/ComponentsToDisplay';
import FilterSettings from './children/FilterSettings';

export default class Settings extends React.Component {
  constructor() {
    super();
    this.state = {
      componentToUpdate: 'Settings',
    };
  }
  render() {
    return (
      <section id="settings" className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <h1 className="component-main-title">Settings</h1>
        </div>
        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 x_panel">
          <ComponentsToDisplay
            componentToUpdate={this.state.componentToUpdate}
            change={this.props.change}
            displayComponent={this.props.displayComponent}
          />
        </div>

        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 filter-settings x_panel">
          <FilterSettings
            componentToUpdate={this.state.componentToUpdate}
            shouldFiltersBeSavedToLocalStorage={this.props.shouldFiltersBeSavedToLocalStorage}
            change={this.props.change}
          />
        </div>
      </section>
    );
  }
}
