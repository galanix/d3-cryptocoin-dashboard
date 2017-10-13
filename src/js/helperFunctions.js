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

export function scaleGraphSize(svgSelector, callback, width, dir) {
    const svg = document.querySelector(svgSelector);
    if(!svg) return;

    const paddingVal = parseInt(getComputedStyle(svg).paddingLeft);
    if(
      (dir === "down" && svg.getBoundingClientRect().width > (width + paddingVal * 2)) ||
      (dir === "up" && Math.ceil(svg.getBoundingClientRect().width) < (width + paddingVal * 2))
    ) {
      svg.setAttribute("width", width);
      svg.setAttribute("height", Math.round(width * 0.6));

      if(callback) callback();
    }
};

export function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export function changeCSSProperties (properties, values, element) {
    properties.forEach((property, index) => {
        element.style[property] = values[index];
    });
};