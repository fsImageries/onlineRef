import { StageSingleton } from "./canvas_oop.js";
import { isTouchDevice, toggleClass } from "./helpers.js";
import * as animate from "./animations.js";

const Stage = new StageSingleton();

// Animations
const link_input_anim = animate.xSideInFade(".linkInput", true, { x: 1000 });
const func_btns_anim = animate.btns_slide(".wrapper_div:not(:nth-child(1))");
func_btns_anim.timeScale(50).play();


// Function buttons click handlers
$("#fileUp").on("change", (e) => Stage.stage.file_2_img(e.target.files[0]));

$(".moveTT").on("click", () => Stage.stage.moveTT_selected());

$(".linkAdd").on("click", () => {
  // // const opt_elem =  $(".optionsButtons .wrapper1")
  const opt_elem = $(".optionsButtons .linkInputWrapper");
  // const bar      = $(".wrapper-bar")
  const class_name = opt_elem.attr("class");
  toggleClass(".optionsButtons .linkInputWrapper", "active");

  if (class_name.includes("active")) link_input_anim.reverse();
  else link_input_anim.play();
});

$(".linkInput").on("keydown", (e) => {
  if (e.key === "Enter") {
    // TODO Validate ULR input
    Stage.stage.add_img($(".linkInput").val());
    link_input_anim.reverse();
    toggleClass(".optionsButtons .linkInputWrapper", "active");
    $(".linkInput").val("");
  }
});

$(".settingsAll").on("click", () => {
  const class_name = $(".settingsAll").attr("class");
  toggleClass(".settingsAll", "active");

  func_btns_anim.timeScale(1);
  if (class_name.includes("active")) func_btns_anim.play();
  else func_btns_anim.reverse();
});

$(".moveDrag").on("click", () => {
  Stage.stage.stageDrag = !Stage.stage.stageDrag;
  Stage.stage.stage.draggable(!Stage.stage.stage.draggable());
});

$(".rotateDrag").on("click", () => {
  Stage.stage.rotateAct = true;
  Stage.stage.toggle_rotation();
});

$(".scaleDrag").on("click", () => {
  Stage.stage.rotateAct = false;
  Stage.stage.toggle_rotation();
});


// $(document).on("click", e => console.log(e.target))