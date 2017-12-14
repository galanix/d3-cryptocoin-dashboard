export default function filterChange(newFilterValue, filterName, componentToUpdate) {
  return (dispatch) => {
    dispatch({
      type: 'CHANGE_FILTERS',
      forComponent: componentToUpdate,
      filterName,
      newFilterValue,
    });
  };
}
