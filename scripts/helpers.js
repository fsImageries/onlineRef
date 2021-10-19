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

const cleanClassName = (class_name, replacers) => {
  for (let name of class_name.split(" ")) {
    if (!replacers.includes(name)) return name;
  }
};

const getClickedClass = (elem) => {
  return cleanClassName($(elem).closest(".settingsBtn")[0].className, [
    "settingsBtn",
    "active",
  ]);
};

export { isTouchDevice, toggleClass, getClickedClass };
