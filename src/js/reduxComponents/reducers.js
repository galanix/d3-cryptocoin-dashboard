import model from "./model";

let reducers = (state = model, action) => {
    let newState = Object.assign({}, state);
    switch(action.type) {
       case 'UPDATE':
         switch(action.forComponent) {
             case 'BitcoinCurrentPrice':                         
               newState.currentPrice.data = action.data;               
               break;
         }
         break;
    }
    return newState;
}

export default reducers;