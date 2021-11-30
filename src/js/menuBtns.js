import $ from "jquery";
import * as imgHelp from "js/imageHelpers";
import * as helper from "js/helper";

const get_fileDialog = (media, [setMedia, setStage], config) => {
  const input = $(document.createElement("input"));
  input.attr("type", "file");
  input.prop("multiple", true);
  input.on("change", async () => {
    const files = Array.from(input.prop("files"));
    const isJson = files.filter((elem, i) => elem.type.includes("json"));

    if (!isJson.length) {
      const filesAttrs = await imgHelp.awaitAllFiles(
        input.prop("files"),
        config
      );
      setMedia([...media, ...filesAttrs]);
    }
    else {
      const json = await helper.get_jsonFile(isJson[0])
      console.log(json)
      setStage(json);
    }
  });

  input.trigger("click"); // opening dialog
  return false; // avoiding navigation
};

export { get_fileDialog };
