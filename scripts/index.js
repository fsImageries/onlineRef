import { StageSingleton, getProxy } from "./canvas_oop.js";
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


// Register key-hold eventListeners

if (!helpers.isTouchDevice()) {
  $(document).on("keyup keydown", (e) => {
    Stage.stage.multScale = e.shiftKey;
    Stage.stage.rotateFree = e.ctrlKey;

    if (e.type === "keydown") {
      if (!e.ctrlKey) e.preventDefault();

      if (e.key === "q" && e.ctrlKey) settingsAll_act()

      if (e.key === "r") proxyStage.rotateAct = !proxyStage.rotateAct;

      if (e.key === "d" && e.ctrlKey) Stage.stage.duplicate_selected();

      if (e.altKey) proxyStage.stageDrag = !proxyStage.stageDrag;

      if (e.key === "m") proxyStage.guidesAct = !proxyStage.guidesAct;
    }

    if (e.key === "Backspace") Stage.stage.delete_selected();
    if (Stage.stage.topLayer !== undefined) Stage.stage.toggle_rotation();
  });
}


// Fucntion buttons callbacks and setup

const varChangeCallback = {
  guidesAct: (value = true) => {
    helpers.toggleClass(".guides", "active");
    btns_presser["guides"].restart();
    if (!value) Stage.stage._remove_guides();
  },
  rotateAct: () => {
    helpers.toggleClass(".rotateTrans", "active");
    helpers.toggleClass(".scaleTrans", "active");
    btns_presser["scaleTrans"].restart();
    btns_presser["rotateTrans"].restart();
    Stage.stage.toggle_rotation();
  },
  stageDrag: () => {
    helpers.toggleClass(".moveDrag", "active");
    btns_presser["moveDrag"].restart();
    Stage.stage.stage.draggable(!Stage.stage.stage.draggable());
  },
};

const proxyStage = getProxy(Stage.stage, varChangeCallback);


// Function buttons click handlers
const settingsAll_act = () => {
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
}

$(".settingsAll").on("click", settingsAll_act)
// () => {
//   const class_name = $(".settingsAll").attr("class");
//   helpers.toggleClass(".settingsAll", "active");

//   if (class_name.includes("active")) {
//     settingsAll_rot_anim.reverse();
//     func_btns_anim.reverse();

//     if ($(".linkAdd").hasClass("active")) $(".linkAdd").click();
//   } else {
//     settingsAll_rot_anim.play();
//     func_btns_anim.play();
//   }
// });

$("#fileUp").on("change", (e) => Stage.stage.file_2_url(e.target.files[0]));

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

$(".moveDrag").on("click",(e) => (proxyStage.stageDrag = !proxyStage.stageDrag));

$(".guides").on("click", (e) => (proxyStage.guidesAct = !proxyStage.guidesAct));

///////////////////////////////////////////////////////////////////////////////

$(".scaleTrans").on("click", (e) => (proxyStage.rotateAct = false));

$(".rotateTrans").on("click", (e) => (proxyStage.rotateAct = true));

$(".moveTT").on("click", (e) => {
  Stage.stage.moveTT_selected();
  btns_presser[helpers.getClickedClass(e.target)].restart();
});

// Activate/display buttons on markup
$(window).on("load", () => {
  $(".settingsBtn").css({ display: "flex" });
});
