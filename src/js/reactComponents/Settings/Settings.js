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
      <div id="settings" className="row">
        <div className="col-12 x_panel">
          <ComponentsToDisplay
            componentToUpdate={this.state.componentToUpdate}
            change={this.props.change}
            displayComponent={this.props.displayComponent}
          />
        </div>

        <div className="col-12 filter-settings x_panel">
          <FilterSettings
            componentToUpdate={this.state.componentToUpdate}
            shouldFiltersBeSavedToLocalStorage={this.props.shouldFiltersBeSavedToLocalStorage}
            change={this.props.change}
          />
        </div>
      </div>
    );
  }
}
