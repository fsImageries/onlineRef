const anim_temp = (selector, tl_conf, fx_conf, from=false) => {
    const tl = gsap.timeline(tl_conf)

    if (from) tl.from(selector, fx_conf)
    else tl.to(selector, fx_conf)
    tl.pause()

    return tl
}


const btn_press = (selector, tl_conf) => {
    const tl = gsap.timeline(tl_conf)


    // tl.to(".moveTT", {scaleX:1, scaleY:1})
    tl.to(selector, {scaleX:1.1, scaleY:1.1})
    tl.to(selector, {scaleX:1, scaleY:1})

    tl.pause()
    return tl
}

const btn_press_manger = (selectors, tl_conf) => {

    const btn_mapper = {}
    // for (let selector of selectors){
    $(selectors).each(idx => {
        const elem = $(selectors)[idx]
        const tl = btn_press(elem, tl_conf)

        const name = elem.className.replaceAll("settingsBtn","").replaceAll("active","").replaceAll(" ","")
        btn_mapper[name] = tl
    })    
    return btn_mapper
}



export {anim_temp, btn_press, btn_press_manger}