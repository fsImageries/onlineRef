function isTouchDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
  }

function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  
function getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }


const toggleClass = (selector, class_name) => {
  const class_attr = $(selector).attr("class")

  if (class_attr.includes(class_name)) {$(selector).removeClass(class_name)}
  else {$(selector).addClass(class_name)}
}

export {isTouchDevice, getDistance, getCenter, toggleClass}