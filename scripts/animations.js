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
        stagger:0.15,
        ease: "Power4.easeOut"
    }

    if (rev) tl.from(selector, settings)
    else tl.to(selector, settings)

    tl.pause()

    return tl
}

const btns_slide = (selector) => {
    let tl = gsap.timeline({
        duration:.15
    })

    const settings = {
        // y: ($(selector).last().offset().top + $(selector).last().height()) * -1,
        xPercent: 100,
        stagger:0.075
    }

    tl.to(selector, settings)
    tl.pause()

    return tl
}


export {heightFade, xSideInFade, btns_slide}