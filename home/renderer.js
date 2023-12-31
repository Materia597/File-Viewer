//all of the elements that are referenced
const btn = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')
const outputArea = document.getElementById("file-output-display")
const goButton = document.getElementById('go')
const outputLimit = document.getElementById('output-limit')
const clearOuput = document.getElementById('clear')
const errorArea = document.getElementById('error-message')
const toTopButton = document.getElementById('to-top')
const outputOffset = document.getElementById('output-offset')

const pathClearButton = document.getElementById('clear-filePath')

const displayStyle = document.getElementById('display-style')


let videoFormats
let imageFormats
let audioFormats
let movingImageFormats

const assignFormatValues = async () => {
    videoFormats = await window.formats.videoFormats()
    imageFormats = await window.formats.imageFormats()
    audioFormats = await window.formats.audioFormats()
    movingImageFormats = await window.formats.movingImageFormats()

    console.log(videoFormats)
    console.log(imageFormats)
    console.log(audioFormats)
    console.log(movingImageFormats)
}

assignFormatValues()

//document.getElementById('filter-options').style.display = "none"

pathClearButton.addEventListener('click', () => {
    filePathElement.innerText = ""
})


clearOuput.addEventListener('click', () => {
    toTopButton.style.visibility = "hidden"
    outputArea.innerHTML = ""
    errorArea.innerText = ""
    //filePathElement.innerText = ""
})


btn.addEventListener('click', async () => {
    let filePath = await window.electronAPI.openFolder()
    //console.log(filePath)
    if (filePath === undefined) filePath = "";
    errorArea.innerText = ""
    filePathElement.innerText = filePath
})


//Code responsible for calling the function to get the files.

goButton.addEventListener('click', () => {
    if(filePathElement.innerText === "") { 
        showError("Please Select a folder to open");
        return;
    };

    if(displayStyle.value == "Seperate") {
        
        outputArea.innerHTML = ""
        errorArea.innerText = ""
    }
    
    
    let filterObject = createFilter()
    //console.log(filterObject)
    //getFiles(filePathElement.innerText)
    getFiles(filterObject)
})

const createFilter = () => {
    let imageFormats = []
    document.querySelectorAll("[data-image-format]").forEach(format => {
        if(format.checked) imageFormats.push(format.dataset.format)
    } )

    let videoFormats = []
    document.querySelectorAll("[data-video-format]").forEach(format => {
        if(format.checked) videoFormats.push(format.dataset.format)
    })

    let audioFormats = []
    document.querySelectorAll("[data-audio-format]").forEach(format => {
        if(format.checked) audioFormats.push(format.dataset.format)
    })

    let filterObject = {
        directory: filePathElement.innerText,
        limit: Number(outputLimit.value),
        offset: Number(outputOffset.value),
        filter: {
            videos: {
                disabled: !videoEnable.checked,
                formats: videoFormats
            },
            images: {
                disabled: !imageEnable.checked,
                formats: imageFormats
            },
            audio: {
                disabled: !audioEnable.checked,
                formats: audioFormats
            }
        }
    }

    return filterObject
}


document.getElementById('to-top').addEventListener('click', () => {window.location.href = "#settings"})





const openMedia = (fullFile) => {
    let mediaWindow = window.open('./media-viewer.html')
    mediaWindow.loadFile(fullFile)
}



const openCarousel = (filterObject = createFilter()) => {
    window.carouselWindow.newInstance(filterObject)
}









function getFiles(direct) {     //Calls the function in main.js responsible for getting all the files in the specified directory
    window.electronAPI.getFiles(direct)
}


const showError = (message = "") => {
    errorArea.innerText = message
}


//handles what happens with the outputs from the getFiles() function
window.electronAPI.receiveFiles((_event, files) => {
    //console.log(files)

    switch(displayStyle.value) {

        case "Seperate":
            formatFilesUsingOutsourcedFilter(files.filteredFiles, {
                videoFormats: files.videoFormats,
                imageFormats: files.imageFormats,
                audioFormats: files.audioFormats
            })
            toTopButton.style.visibility = "visible"
            break;
        case "Comic":
            window.openNewWindow.newWindowWithMultipleFiles('./collection/collection-window.html', createFilter())
            break;
        case "Collection":
            openCarousel();
    }

})


window.electronAPI.errorMessage((_event, message) => {
    errorArea.innerText = message;
})



const doFileChecks = (files) => {
    //checks if the limit value is set to 0, if so then no limit is applied, otherwise there is a max value for the number of outputs
    let limit = Number(outputLimit.value)
    if(limit === 0) {limit = files.length}

    if(files.length === 0) {
        showError("Your filter has resulted in no files being shown.")
        return;
    }

    //start is the value defined by offset, this converts the value typed into a number. If the value isn't a number, it's set to 0
    let start;
    try {
        start = Number(outputOffset.value)
    } catch (error) {
        console.log(error)
        start = 0;
    }
    if(start === NaN) start = 0
    //console.log(start)

    //if the offset value is so large that no output would be drawn, then this error is thrown
    
    if(files[start] === undefined && start !== 0) {
        //errorArea.innerText = "Offset value is too large and no output can be shown"
        showError("Offset Value was too large and no output can be shown")
        return;
    }

    //if there are no files that have a recognized extension, then this error is thrown
    if(files[start] === undefined && start == 0)
    {
        //errorArea.innerText = "There are no recognized files in this folder"
        showError("There are no recognized files in this folder")
        return;
    }


    return [files, limit, start]
}



const videoEnable = document.getElementById('media:allow-videos')
const imageEnable = document.getElementById('media:allow-images')
const audioEnable = document.getElementById('media:allow-audio')

videoEnable.addEventListener('change', () => {
    let videoOptions = document.querySelectorAll('[data-video-format]')
    videoOptions.forEach(option => {
        option.disabled = !videoEnable.checked
        option.closest('td').dataset.disabled = !videoEnable.checked
    })
})

imageEnable.addEventListener('change', () => {
    let imageOptions = document.querySelectorAll('[data-image-format]')
    imageOptions.forEach(option => {
        option.disabled = !imageEnable.checked
        option.closest('td').dataset.disabled = !imageEnable.checked
    })
    
})

audioEnable.addEventListener('change', () => {
    let audioOptions = document.querySelectorAll('[data-audio-format]')
    audioOptions.forEach(option => {
        option.disabled = !audioEnable.checked
        option.closest('td').dataset.disabled = !audioEnable.checked
    })
})

/**
 * @argument filteredFiles :    The files that were previously filtered, this is an array of object which includes fullPath, name, and extension
 * @argument filterObject :    The formats that were used as part of the filter, this will be an object like: {videoFormats: [], imageFormats: []}
 * @description Uses an outsourced filter to use for the formatting in the normal output mode, rather than doing the filtering itself
 * @returns undefined
 */
const formatFilesUsingOutsourcedFilter = (filteredFiles, filterObject) => {
    console.log(filteredFiles)
    console.log(filterObject)
    if(filteredFiles.length === 0) {
        showError("Your filter has resulted in zero files being output")
        return;
    }

    filteredFiles.forEach(file => {
        let ext = file.extension.toLowerCase()
        let elementString
        let type
        if(filterObject.videoFormats.includes(ext)) {
            if(!videoEnable.checked) return
            elementString = `<video class="local-video file-output" src="${file.fullPath}" controls></video>`
            type = "video"
        }
        if(filterObject.imageFormats.includes(ext)) {
            if(!imageEnable.checked) return
            elementString = `<img class='local-image file-output' src="${file.fullPath}">`
            if(ext === ".gif" || ext === ".webp") elementString = `<img class='local-image file-output' src="${file.fullPath}" repeat>`
            type = "image"
        }
        if(filterObject.audioFormats.includes(ext)) {
            if(!audioEnable.checked) return;
            elementString = `<audio class="local-audio file-output" controls><source src=\"${file.fullPath}\"></audio>`
            type = "audio"
        }
        
        console.log(file.fullPath)

        

        let corrected = file.fullPath.replace(/[\\]/g, "\\\\")
        //outputArea.insertAdjacentHTML('beforeend', `<div class="output-container">${elementString}<p onclick="window.newWindow.specificNew(\`${new URL(file.fullPath)}\`, \`${type}\`)">Open</p></div>`)
    
        //testing for macos version
        outputArea.insertAdjacentHTML('beforeend', `<div class="output-container">${elementString}<p class="file-name">${file.name}</p><p class="open-file" onclick="window.newWindow.specificNew(\`${corrected}\`, \`${type}\`)">Open</p></div>`)
    })
}

const tryNew = () => {
    window.newWindow.specificEmpty()
}



