export function formProperDateFormat(year, month, day) { 
    // example: turns 2017, 5, 14 into 2017-05-15
    let dateStr = `${year}-${month < 10 ? ("0" + month) : month}-${day < 10 ? ("0" + day) : day}`;
    return dateStr;
}

export function createDateObj(dateStr) {
    const dateArr = dateStr.split("-");
    const year = dateArr[0];
    const month = dateArr[1] - 1;
    const day =  dateArr[2]; // - 1
    return new Date(year, month, day);
}