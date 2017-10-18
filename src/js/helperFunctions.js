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

export function scaleGraphSize(svgSelector, width, dir, callback) {
    const svg = document.querySelector(svgSelector);
    if(!svg) {
        return;
    }

    const svgWidth = +svg.getAttribute("width");    
    if(
      (dir === "down" && svgWidth > width) ||
      (dir === "up" && svgWidth < width)
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

export function removeDuplicates(array) {
    const a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}