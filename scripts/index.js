import { StageSingleton, getProxy } from "./canvas_oop.js";
import * as helpers from "./helpers.js";
import * as animate from "./animations.js";

const Stage = new StageSingleton();

// Animations

let speedMult = $(":root").css("--speed-mult")

const btns_entrance = animate.anim_temp(
  ".settingsBtn:not(:nth-child(1)), .settingsSpacer",
  { duration: 0.1 * speedMult },
  { x: 100, ease: Power0.easeNone, delay: -.6 / speedMult , stagger: 0.1 * speedMult},
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

// Function buttons callbacks and setup

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

$("#fileUp").on("change", (e) => {
  const file = e.target.files[0]
  if (file.type === "application/json") {
    helpers.loadJsonFile(file, (data) => {
      if (data["Stage"] !== undefined){
        Stage.stage.set_state(data.Stage)
      }
    })
  } else Stage.stage.file_2_url(file)
});

$(".fileDown").on("click", (e) => {
  const data = JSON.stringify(Stage.stage.get_state())
  helpers.download(data, "stage_state.json")
})

$(".linkAdd").on("click", (e) => {
  $(".linkzone, .linkAdd").toggleClass("active");
});

$("#linkInput").on("keydown", (e) => {
  if (e.key === "Enter") {
    Stage.stage.url_2_canvas($("#linkInput").val());
    $(".linkAdd").click();
    $("#linkInput").val("");
  }
});

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


window.Stage = Stage.stage