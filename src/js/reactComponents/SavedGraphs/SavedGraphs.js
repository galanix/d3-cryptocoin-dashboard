import React from 'react';
import { Link } from 'react-router-dom';

export default class SavedGraphs extends React.Component {
  render() {
    return (
      <section id="saved-graphs" className="row">
        <p>
            You currently have no saved graphs.
            <Link to={this.props.linkToGraphCreation}> Create one</Link>
        </p>
      </section>
    );
  }
}