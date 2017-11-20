// used for single http request
export function handleDataRequest(url, componentToUpdate, newData) {  
  // for synchronous changes, data is already provided via newData  
  if(!!newData && !url) {
    return dispatch => dispatch(updateData(newData, componentToUpdate));
  }
  // for async changes we first make a get request
  return dispatch => 
    fetch(url)
      .then(response => response.json())
      .then(data => dispatch(updateData(data, componentToUpdate)))
      .catch(error => console.warn(error));
}

// used for multiple http requests that all need to resolve first, then do smth with result
export function handleMultipleDataReqeuests(urls, componentToUpdate, formatDataCollection) {  
  const fetchedData = urls.map(url => {
    return fetch(url)
      .then(res => res.json());
  });
  
  return dispatch =>
    Promise.all(fetchedData) // to update once all of the data is received
      .then(results => {
        let newCollection = results;
        // format data if needed
        if(!!formatDataCollection) {
          newCollection = formatDataCollection(results);        
        }
        dispatch(updateData(newCollection, componentToUpdate));
      });
}

function updateData(newData, componentToUpdate) {
  return {
    type: 'UPDATE_DATA',
    forComponent: componentToUpdate,
    data: newData
  };
}