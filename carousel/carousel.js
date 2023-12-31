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

            if(slides.children.length !== 1) {
                slides.children[newIndex].dataset.active = true
                delete activeSlide.dataset.active

                slides.querySelectorAll("video").forEach(video => {
                    video.pause()
                })

                slides.querySelectorAll("audio").forEach(audio => {
                    audio.pause()
                })
            }
            
        })
    })
}

const getCarouselFiles = () => {
    window.carouselWindow.getData();
}

window.carouselWindow.receiveData((_event, fileList) => {
    //fill in once main.js code has been completed
    const dataSlides = document.querySelector('[data-slides]')

    //console.log(fileList)


    fileList.filteredFiles.forEach(file => {
        let startTag = "<li class='slide'>"
        let closeTag = "</li>"
        let inner;

        let ex = file.extension.toLowerCase()

        if(fileList.videoFormats.includes(ex)) {
            inner = `<video src="${file.fullPath}" controls></video>`
        }
        if(fileList.imageFormats.includes(ex)) {
            inner = `<img src="${file.fullPath}" `
            if(ex === ".webp" || ex === ".gif") {
                inner += "repeat"
            }
            inner += "/>"
        }
        if(fileList.audioFormats.includes(ex)) {
            inner = `<audio src="${file.fullPath}" controls></audio>`
        }

        dataSlides.insertAdjacentHTML('beforeend', `${startTag}${inner}${closeTag}`)
    })

    dataSlides.children[0].dataset.active = true;

    fillCarousel()
})


getCarouselFiles()