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


const download =(data, fileName, contentType="text/plain") => {
  let a = document.createElement("a");
  let file = new Blob([data], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

const loadJsonFile = (file, callback) => {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result)
    callback(data)
  };
  reader.readAsText(file)
}

export { isTouchDevice, toggleClass, getClickedClass, download, loadJsonFile };
