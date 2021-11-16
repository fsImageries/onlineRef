import * as imgHelp from "js/imageHelpers";

const dropHandler = async (e, media, setMedia, config, pointer) => {
  e.preventDefault();

  // get pure text
  // const content = e.dataTransfer.getData("text");

  // droped files
  const files = e.dataTransfer.files;

  // get html (e.g. from google and stuff)
  // const content = e.dataTransfer.getData("text/html");
  setMedia([
    ...media,
    await imgHelp.file_2_url(files[0], config, pointer),
  ]);
};

export { dropHandler };
