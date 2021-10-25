import { StageSingleton } from "./canvas_oop.js";
import * as helpers from "./helpers.js";
import * as animate from "./animations.js";

const Stage = new StageSingleton();

// Animations

const link_input_anim = animate.anim_temp(
  ".linkInput",
  { duration: 0.15 },
  { x: 1000, ease: Power4.easeOut },
  true
);

const func_btns_anim = animate.anim_temp(
  ".wrapper_div:not(:nth-child(1))",
  { duration: 0.15 },
  { xPercent: 100, stagger: 0.075 },
  true
);
const settingsAll_rot_anim = animate.anim_temp(
  ".settingsAll",
  { duration: 0.25 },
  { rotate: 180 },
  true
);

const btns_presser = animate.btn_press_manger(".settingsBtn", {
  duration: 0.05,
  ease: Power4.easeOut,
});

// Function buttons click handlers
$(".settingsAll").on("click", () => {
  const class_name = $(".settingsAll").attr("class");
  helpers.toggleClass(".settingsAll", "active");

  if (class_name.includes("active")) {
    settingsAll_rot_anim.reverse();
    func_btns_anim.reverse();

    if ($(".linkAdd").hasClass("active")) $(".linkAdd").click();
  } else {
    settingsAll_rot_anim.play();
    func_btns_anim.play();
  }
});

$("#fileUp").on("change", (e) => Stage.stage.file_2_img(e.target.files[0]));

$(".linkAdd").on("click", (e) => {
  const opt_elem = $(".optionsButtons .linkInputWrapper");
  const class_name = opt_elem.attr("class");
  helpers.toggleClass(".optionsButtons .linkInputWrapper", "active");
  helpers.toggleClass(".linkAdd", "active");
  btns_presser[helpers.getClickedClass(e.target)].restart();

  if (class_name.includes("active")) link_input_anim.reverse();
  else link_input_anim.play();
});

$(".linkInput").on("keydown", (e) => {
  if (e.key === "Enter") {
    // TODO Validate ULR input
    // Stage.stage.add_img($(".linkInput").val());
    const wu = Stage.stage.url_2_canvas($(".linkInput").val());
    link_input_anim.reverse();
    helpers.toggleClass(".optionsButtons .linkInputWrapper", "active");
    helpers.toggleClass(".linkAdd", "active");

    if ($(".linkAdd").hasClass("active")) $(".linkAdd").click();
    $(".linkInput").val("");
  }
});

///////////////////////////////////////////////////////////////////////////////

$(".playVideo").on("click", (e) => {
  Stage.stage.video_play_selected();
});

///////////////////////////////////////////////////////////////////////////////

$(".moveDrag").on("click", (e) => {
  helpers.toggleClass(".moveDrag", "active");
  btns_presser[helpers.getClickedClass(e.target)].restart();

  Stage.stage.stageDrag = !Stage.stage.stageDrag;
  Stage.stage.stage.draggable(!Stage.stage.stage.draggable());
});

$(".guides").on("click", (e) => {
  helpers.toggleClass(".guides", "active");
  btns_presser[helpers.getClickedClass(e.target)].restart();

  Stage.stage.guidesAct = !Stage.stage.guidesAct;
  // Stage.stage.stage.draggable(!Stage.stage.stage.draggable());
});

///////////////////////////////////////////////////////////////////////////////

$(".scaleTrans").on("click", (e) => {
  if (Stage.stage.rotateAct) {
    helpers.toggleClass(".rotateTrans", "active");
    helpers.toggleClass(".scaleTrans", "active");
    btns_presser[helpers.getClickedClass(e.target)].restart();
  }

  Stage.stage.rotateAct = false;
  Stage.stage.toggle_rotation();
});

$(".rotateTrans").on("click", (e) => {
  if (!Stage.stage.rotateAct) {
    helpers.toggleClass(".rotateTrans", "active");
    helpers.toggleClass(".scaleTrans", "active");
    btns_presser[helpers.getClickedClass(e.target)].restart();
  }

  Stage.stage.rotateAct = true;
  Stage.stage.toggle_rotation();
});

$(".moveTT").on("click", (e) => {
  Stage.stage.moveTT_selected();
  btns_presser[helpers.getClickedClass(e.target)].restart();
});


// Activate/display buttons on markup
await $(".settingsBtn").css({ display: "flex" });
