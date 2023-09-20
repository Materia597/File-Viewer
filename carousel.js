const fillCarousel = () => {
    const buttons = document.querySelectorAll("[data-carousel-button]")

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const offset = button.dataset.carouselButton == "next" ? 1 : -1;
            const slides = button   
                .closest("[data-carousel]")
                .querySelector("[data-slides]")

            const activeSlide = slides.querySelector("[data-active]")
            let newIndex = [...slides.children].indexOf(activeSlide) + offset;
            if(newIndex < 0) newIndex = slides.children.length - 1
            if(newIndex >= slides.children.length) newIndex = 0

            slides.children[newIndex].dataset.active = true
            delete activeSlide.dataset.active

            slides.querySelectorAll("video").forEach(video => {
                video.pause()
            })
        })
    })

    
    /* for the initialization step
    buttons[0]
        .closest("[data-carousel]")
        .querySelector("[data-slides]")
        .children[0]
        .dataset.active = true
    */
}

const getCarouselFiles = () => {
    window.carouselWindow.getData();
}

window.carouselWindow.receiveData((_event, fileList) => {
    //fill in once main.js code has been completed
    const dataSlides = document.querySelector('[data-slides]')

    fileList.forEach(file => {
        let startTag = "<li class='slide'>"
        let closeTag = "</li>"
        let inner;

        let ex = file.extension

        switch(ex.toLowerCase()) {
            case '.mp4':
            case '.webm':
                inner = `<video src="${file.fullPath}" controls></video>`
                break;
            case '.gif':
                inner = `<img src="${file.fullPath}" repeat>`
                break;
            case '.png':
            case '.jpg':
                inner = `<img src="${file.fullPath}">`
                break;
        }

        dataSlides.insertAdjacentHTML('beforeend', `${startTag}${inner}${closeTag}`)
    })

    dataSlides.children[0].dataset.active = true;

    fillCarousel()
})


getCarouselFiles()