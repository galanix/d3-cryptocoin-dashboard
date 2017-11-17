export function dataRequest(url, componentToUpdate, newData) {
  // for synchronous changes, data is already provided via newData  
  if(!!newData && !url) {
    return dispatch => dispatch(updateData(newData, componentToUpdate));
  }
  // for async changes we first make a get request
  return dispatch => fetch(url)
    .then(response => response.json())
    .then(data => dispatch(updateData(data, componentToUpdate)))
    .catch(error => console.warn(error));
}

function updateData (newData, componentToUpdate) {  
  return {
    type: 'UPDATE_DATA',
    forComponent: componentToUpdate,
    data: newData
  };
}