import { add_img, toggle_rotation, delete_selected, moveTT_selected, file_2_canvas, fit_stage} from "./canvas.js";
import {isTouch, Config, StageConfig} from "./canvas.js"
import { toggleClass } from "./helpers.js";

import * as animate from "./animations.js"


// Animations
const link_input_anim   = animate.xSideInFade(".linkInput", true, {x:1000})


// Register key-holds (if not touchdevice)
if (!isTouch) {
    $(".moveDrag").closest(".wrapper_div").css("display", "none")
    $(".rotateDrag").closest(".wrapper_div").css("display", "none")
    $(".scaleDrag").closest(".wrapper_div").css("display", "none")

    $(document).on("keyup keydown", (e) => {
        Config.multScale = e.shiftKey
        Config.rotateFree = e.ctrlKey

        if (e.key === "r" && e.type === "keydown"){
            Config.rotateAct =  !Config.rotateAct
            toggle_rotation()
        }

        if (e.key === "Backspace")
            delete_selected();
        if (StageConfig.TopLayer !== undefined) {
            toggle_rotation();
        }
    });
}
// if touchdevice register extra buttons and helps
else {

    $(".rotateDrag").on("click", () => {
        StageConfig.TransMain.anchorSize(StageConfig.TransMain.anchorSize() ? 0 : 7.5)
        Config.rotateAct = true
        toggle_rotation()
    })

    $(".scaleDrag").on("click", () => {
        StageConfig.TransMain.anchorSize(StageConfig.TransMain.anchorSize() ? 0 : 7.5)
        Config.rotateAct = false
        toggle_rotation()
    })

    $(".moveDrag").on("click", () => {
        StageConfig.Stage.draggable(!StageConfig.Stage.draggable());
    });
    
}


// Drag and Drop (files and links) onto whole window
$(window).on("dragover", e => {
    e.preventDefault();
});

// Jquery doesn't provide 'e.DataTransfer'
window.addEventListener("drop", e => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]

    if (file){
        if (file.type.startsWith("image/")){
            file_2_canvas(file)
        }
    } else {
        const content = $(e.dataTransfer.getData("text/html"))
        if (content.attr("src")){
            add_img(content.attr("src"))
        }
    }
})


// Register Event handlers 

$(window).on("resize", fit_stage)

// Canvas function buttons 
$("#fileUp").on("change", e => file_2_canvas(e.target.files[0]))

$(".moveTT").on("click", () => moveTT_selected())

$(".linkAdd").on("click", () => {
    // // const opt_elem =  $(".optionsButtons .wrapper1")
    const opt_elem =  $(".optionsButtons .linkInputWrapper")
    // const bar      = $(".wrapper-bar")
    const class_name = opt_elem.attr("class")
    toggleClass(".optionsButtons .linkInputWrapper", "active")

    if (class_name.includes("active")) link_input_anim.reverse()
     else link_input_anim.play()
})

$(".linkInput").on("keydown", e => {
    if (e.key === "Enter"){
        // TODO Validate ULR input
        add_img($(".linkInput").val())
        link_input_anim.reverse()
        toggleClass(".optionsButtons .linkInputWrapper", "active")
        $(".linkInput").val("")
    }
});
