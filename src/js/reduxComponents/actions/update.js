export function dataRequest(url, componentToUpdate, newData) {
  // for synchronous changes, data is already provided via newData
  if(!!newData && !url) {
    return dispatch => dispatch(_updateData(newData, componentToUpdate)); // ?
  }

  return dispatch => fetch(url)
    .then(response => response.json())
    .then(data => dispatch(_updateData(data, componentToUpdate)))
    .catch(error => console.warn(error));
}

function _updateData (newData, componentToUpdate) {
  return {
    type: 'UPDATE_DATA',
    forComponent: componentToUpdate,
    data: newData
  };
}