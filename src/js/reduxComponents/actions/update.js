export const dataRequest = (url, componentToUpdate) => {  
  return dispatch => fetch(url)
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