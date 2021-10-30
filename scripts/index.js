import { StageSingleton, getProxy } from "./canvas_oop.js";
import * as helpers from "./helpers.js";
import * as animate from "./animations.js";

const Stage = new StageSingleton();

// Animations

const btns_entrance = animate.anim_temp(
  ".settingsBtn:not(:nth-child(1)), .settingsSpacer",
  { duration: 0.1 },
  { x: 100, ease: Power0.easeNone, delay: -0.6, stagger: 0.1 },
  true
);

// Register key-hold eventListeners
if (!helpers.isTouchDevice()) {
  $(document).on("keyup keydown", (e) => {
    Stage.stage.multScale = e.shiftKey;
    Stage.stage.rotateFree = e.ctrlKey;

    if (e.type === "keydown") {
      if (!e.ctrlKey) e.preventDefault();

      if (e.key === "q" && e.ctrlKey) settingsAll_act();

      if (e.key === "r") proxyStage.rotateAct = !proxyStage.rotateAct;

      if (e.key === "d" && e.ctrlKey) Stage.stage.duplicate_selected();

      if (e.altKey) proxyStage.stageDrag = !proxyStage.stageDrag;

      if (e.key === "m") proxyStage.guidesAct = !proxyStage.guidesAct;
    }

    if (e.key === "Backspace") Stage.stage.delete_selected();
    if (Stage.stage.topLayer !== undefined) Stage.stage.toggle_rotation();
  });
} else {
  $(".linkzone .content").css({flexDirection: "column"})
}

$(document).on("click touchstart", (e) => {
  // Check if linkInput modal should be closed
  const isModal = $(e.target).closest(".linkzone").length === 0;
  const isLinkBtn = $(e.target).closest(".linkAdd").length === 0;
  if (isModal && isLinkBtn && $(".linkzone").hasClass("active"))
    $(".linkAdd").click()
});

// Fucntion buttons callbacks and setup

const varChangeCallback = {
  guidesAct: (value = true) => {
    helpers.toggleClass(".guides", "active");
    if (!value) Stage.stage._remove_guides();
  },
  rotateAct: () => {
    helpers.toggleClass(".rotateTrans", "active");
    helpers.toggleClass(".scaleTrans", "active");
    Stage.stage.toggle_rotation();
  },
  stageDrag: () => {
    helpers.toggleClass(".moveDrag", "active");
    Stage.stage.stage.draggable(!Stage.stage.stage.draggable());
  },
};

const proxyStage = getProxy(Stage.stage, varChangeCallback);

// Function buttons click handlers
const settingsAll_act = () => {
  helpers.toggleClass(".settingsAll", "active");

  $(".menuContainer").toggleClass("active");

  if ($(".menuContainer").hasClass("active")) btns_entrance.play();
  else btns_entrance.reverse();
};

$(".settingsAll").on("click", settingsAll_act);

$("#fileUp").on("change", (e) => Stage.stage.file_2_url(e.target.files[0]));

$(".linkAdd").on("click", (e) => {
  $(".linkzone, .linkAdd").toggleClass("active");
  // $(".linkAdd").toggleClass

  // const opt_elem = $(".optionsButtons .linkInputWrapper");
  // const class_name = opt_elem.attr("class");
  // helpers.toggleClass(".optionsButtons .linkInputWrapper", "active");
  // helpers.toggleClass(".linkAdd", "active");

  // if (class_name.includes("active")) link_input_anim.reverse();
  // else link_input_anim.play();
});

$("#linkInput").on("keydown", (e) => {
  if (e.key === "Enter") {
    Stage.stage.url_2_canvas($("#linkInput").val());
    $(".linkAdd").click();
    $("#linkInput").val("");
  }
});

// $(".linkInput").on("keydown", (e) => {
//   if (e.key === "Enter") {
//     // TODO Validate ULR input
//     // Stage.stage.add_img($(".linkInput").val());
//     const wu = Stage.stage.url_2_canvas($(".linkInput").val());
//     link_input_anim.reverse();
//     helpers.toggleClass(".optionsButtons .linkInputWrapper", "active");
//     helpers.toggleClass(".linkAdd", "active");

//     if ($(".linkAdd").hasClass("active")) $(".linkAdd").click();
//     $(".linkInput").val("");
//   }
// });

///////////////////////////////////////////////////////////////////////////////

$(".playVideo").on("click", (e) => {
  Stage.stage.video_play_selected();
});

///////////////////////////////////////////////////////////////////////////////

$(".moveDrag").on(
  "click",
  (e) => (proxyStage.stageDrag = !proxyStage.stageDrag)
);

$(".guides").on("click", (e) => (proxyStage.guidesAct = !proxyStage.guidesAct));

///////////////////////////////////////////////////////////////////////////////

$(".scaleTrans").on("click", (e) => (proxyStage.rotateAct = false));

$(".rotateTrans").on("click", (e) => (proxyStage.rotateAct = true));

$(".moveTT").on("click", (e) => {
  Stage.stage.moveTT_selected();
});

// Activate/display buttons on markup
$(window).on("load", () => {
  $(".settingsBtn").css({ display: "flex" });
});
