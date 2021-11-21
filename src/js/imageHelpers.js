const get_ratio = (layerSize, stageSize) => {
  const hRatio = stageSize.width / layerSize.width;
  const vRatio = stageSize.height / layerSize.height;
  return Math.min(hRatio, vRatio) * 0.85;
};

const get_scaled_size = (layerSize, stageSize) => {
  const too_big =
    layerSize.height > stageSize.height || layerSize.width > stageSize.width;
  const ratio = too_big ? get_ratio(layerSize, stageSize) : 1;

  return {
    width: layerSize.width * ratio,
    height: layerSize.height * ratio,
  };
};

const get_imgSize = (src) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve([img.width, img.height]);
    img.onerror = reject;
    img.src = src;
  });
};

const build_img = async (src, config, imageProps = null) => {
  let props;

  props = { src: src, x: 0, y: 0, width: 0, height: 0, type: "" };
  const [width, height] = await get_imgSize(src);
  props.width = width;
  props.height = height;

  props = { ...props, ...imageProps };

  if (
    (props.width > config.width || props.height > config.height) &&
    !imageProps["width"] &&
    !imageProps["height"]
  )
    props = { ...props, ...get_scaled_size(props, config) };
  return props;
};

const add_media = (src, config, pointer) => {
  return build_img(src, config, pointer);
};

const file_2_url = async (file, config, pointer) => {
  const fileurl = await get_fileURL(file);
  return build_img(fileurl, config, pointer);
};

const get_fileURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
};

const fetch_file = async (url) => {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return blob;
  } catch (_) {
    return null;
  }
};

const get_srcURL = (html) => {
  let e = document.createElement("div");
  let r = document.createRange();
  r.selectNodeContents(e);
  let f = r.createContextualFragment(html);
  e.appendChild(f);
  try {
    return e.firstElementChild.src;
  } catch (_) {
    return false;
  }
};

const awaitAllFiles = (files, config, pointer) => {
  return Promise.all(
    Object.values(files).map(async (file) => {
      const ret = await file_2_url(file, config, pointer);
      return ret;
    })
  );
};

export { build_img, add_media, file_2_url, fetch_file, get_srcURL, get_fileURL, awaitAllFiles };
