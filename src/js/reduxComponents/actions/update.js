export const dataRequest = (url, display, componentToUpdate) => {  
  if(!display) return; 
  return dispatch => _fetchData(dispatch, url, componentToUpdate);
};

export const filterChange = (newFilterValue, filterName, componentToUpdate) => {
  return dispatch => {
    dispatch({
      type: 'CHANGE_FILTERS',
      forComponent: componentToUpdate,
      filterName,
      newFilterValue,
    });
  };
};

const _fetchData = (dispatch, url, componentToUpdate) => {
  return fetch(url)
    .then(response => response.json())
    .then(data => dispatch(_updateData(data, componentToUpdate)))
    .catch(error => console.warn(error));
};

const _updateData = (newData, componentToUpdate) => {
  return {
    type: 'UPDATE_DATA',
    forComponent: componentToUpdate,
    data: newData
  };
};