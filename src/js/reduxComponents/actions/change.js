export const changeFilterSettings = (newFilterValue, filterName, componentToUpdate) => {    
    return () => {
        return {
            type: 'CHANGE_FILTERS',
            forComponent: componentToUpdate,
            filterName,
            newFilterValue,
        }        
    }
};