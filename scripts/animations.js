const heightFade = (selector, rev=false) => {
    let tl = gsap.timeline({duration:.15})
    const settings = {
        scaleY:0,
    }

    if (rev) tl.from(selector, settings)
    else tl.to(selector, settings)

    tl.pause()

    return tl
}

const xSideInFade = (selector, rev=false, settings_conf=false) => {
    let tl = gsap.timeline({duration:.15})
    const settings = settings_conf ? settings_conf : {
        x:50,
        stagger:0.15
    }

    if (rev) tl.from(selector, settings)
    else tl.to(selector, settings)

    tl.pause()

    return tl
}


export {heightFade, xSideInFade}