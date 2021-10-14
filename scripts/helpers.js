function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

const toggleClass = (selector, class_name) => {
  const class_attr = $(selector).attr("class");

  if (class_attr.includes(class_name)) {
    $(selector).removeClass(class_name);
  } else {
    $(selector).addClass(class_name);
  }
};

export { isTouchDevice, toggleClass };
