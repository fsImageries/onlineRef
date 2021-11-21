import * as imgHelp from "js/imageHelpers";


//* Handlers

const dropHandler = async (e, media, setMedia, config, pointer) => {
  let url;
  const files = e.dataTransfer.files;

  if (files.length) {
    const filesAttrs = await imgHelp.awaitAllFiles(files, config, pointer);
    setMedia([...media, ...filesAttrs]);
    return;
  } else {
    const content = e.dataTransfer.getData("text/html");
    const srcUrl = imgHelp.get_srcURL(content);
    let file = await imgHelp.fetch_file(srcUrl);

    if (file) {
      url = await imgHelp.get_fileURL(file);
    } else {
      try {
        url = new URL(srcUrl).href;
      } catch (_) {
        return;
      }
    }

    const img = await imgHelp.build_img(url, config, pointer);
    setMedia([...media, img]);
  }
};

export { dropHandler };
