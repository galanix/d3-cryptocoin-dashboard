export function initBitcoinCurrentPrice(url, display) {  
  if(!display) {
    return;
  }  
  return function(dispatch) {    
    return fetch(url)
      .then(response => response.json())
      .then(data => dispatch(_updateData(data)))
      .catch(error => console.warn(error));
  }
};

function _updateData(newData) {
  return {
    type: 'UPDATE',
    forComponent: 'BitcoinCurrentPrice',
    data: newData
  }
};