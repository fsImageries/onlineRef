import { v4 as uuidv4 } from "uuid";
import useImage from "use-image";
import useVideo from "js/use-video";

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
    // img.onload = () => resolve([img.width, img.height]);
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const get_vidSize = (src) => {
  return new Promise((resolve, reject) => {
    let video = document.createElement("video");
    // video.onloadedmetadata = () =>
    //   resolve([video.videoWidth, video.videoHeight]);
    video.onloadedmetadata = () => resolve(video);
    video.onerror = reject;
    video.crossOrigin = "anonymous";
    video.src = src;
    video.pause();
  });
};

const construct_image = (props) => {
  let image;
  if (props.type === "img") {
    [image] = useImage(props.src);

    if (image) {
      props = { ...props, width: image.width, height: image.height };
    }
  } else {
    const [temp, size] = useVideo(imageRef, props.src);
    props = { ...props, ...size };
    image = temp;
  }

  // return {...props, image:image}
  return [image, props];
};

const build_img = async (src, stage, imageProps = null) => {
  const type = infere_type(src);
  if (!type) return type;

  let props = {
    src: src,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    type: type,
    id: uuidv4(),
  };

  if (type === "img") {
    const image = await get_imgSize(src);
    props.width = image.width;
    props.height = image.height;
    props.image = image;
  } else {
    const image = await get_vidSize(src);
    props.width = image.videoWidth;
    props.height = image.videoHeight;
    props.image = image;
  }

  if (imageProps === null) {
    imageProps = { x: stage.width / 2, y: stage.height / 2, mid: true };
    //TODO When zoomed in import doesn't center anymore
  }

  props = { ...props, ...imageProps };

  if (imageProps.noMod) return props;

  // const get_scaled = () => {
  //   return {
  //     width: stage.width - props.x,
  //     height: stage.height - props.y,
  //   };
  // };
  // const scaledStage = (imageProps.noScale && scaleCheck) ? stage : get_scaled()
  const scaledStage = stage;

  if (
    (props.width > scaledStage.width || props.height > scaledStage.height) &&
    !imageProps["width"] &&
    !imageProps["height"]
  ) {
    props = { ...props, ...get_scaled_size(props, scaledStage) };
  }

  if (imageProps.mid) {
    // Center image around xy-pos
    const midX = props.x - props.width / 2;
    const midY = props.y - props.height / 2;
    props = {
      ...props,
      x: (Math.max(midX, 0) - stage.x) * stage.scaleX,
      y: (Math.max(midY, 0) - stage.y) * stage.scaleY,
    };
  }

  return props;
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
    const resp = await fetch(url, { method: "GET" });
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

const test_url = async (url) => {
  let file = await fetch_file(url);
  if (file) {
    return get_fileURL(file);
  } else {
    try {
      return new URL(url).href;
    } catch (_) {
      return false;
    }
  }
};

//! should probably look up a real mime type solution

const valid_imgs = "jpeg jpg png apng svg bmp";
const valid_vids = "mp4 webm ogg 3gp";

const infere_type = (url) => {
  let isImg = url.includes("image");
  let isVid = url.includes("video");

  if (!isImg && !isVid) {
    const url_split = url.split(".");
    const ext = url_split[url_split.length - 1].toLowerCase();

    if (valid_imgs.includes(ext)) {
      return "img";
    } else if (valid_vids.includes(ext)) {
      return "vid";
    } else return false;
  }

  return isImg ? "img" : "vid";
};

export {
  build_img,
  file_2_url,
  fetch_file,
  get_srcURL,
  get_fileURL,
  awaitAllFiles,
  test_url,
  construct_image,
};
