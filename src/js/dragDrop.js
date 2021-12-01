import * as imgHelp from "js/imageHelpers";

//* Handlers

const dropHandler = async (e, media, setMedia, config, pointer) => {
  let url;
  const files = e.dataTransfer.files;
  const html = e.dataTransfer.getHTML();
  const text = e.dataTransfer.getText();

  // -check if files exist and could be used
  if (files.length) {
    try {
      const filesAttrs = await imgHelp.awaitAllFiles(files, config, pointer);
      setMedia([...media, ...filesAttrs]);
      return;
    } catch (e) {console.trace(e)}
  }
  const srcUrl = imgHelp.get_srcURL(html);

  if (srcUrl) url = await imgHelp.test_url(srcUrl);
  else url = await imgHelp.test_url(text);
  
  if (!url) return;

  const img = await imgHelp.build_img(url, config, pointer);
  setMedia([...media, img]);
};

export { dropHandler };
