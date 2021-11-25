import $ from "jquery";
import * as imgHelp from "js/imageHelpers";

const get_fileDialog = (media, setMedia, config) => {
  const input = $(document.createElement("input"));
  input.attr("type", "file");
  input.prop("multiple", true)
  input.on("change", async () => {
    const filesAttrs = await imgHelp.awaitAllFiles(input.prop("files"), config);
    setMedia([...media, ...filesAttrs]);
  });

  input.trigger("click"); // opening dialog
  return false; // avoiding navigation
};


export { get_fileDialog };
