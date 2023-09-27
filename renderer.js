//all of the elements that are referenced
const btn = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')
const outputArea = document.getElementById("file-output-display")
const goButton = document.getElementById('go')
const outputLimit = document.getElementById('output-limit')
const limitDisplay = document.getElementById('limit-value')
const clearOuput = document.getElementById('clear')
const errorArea = document.getElementById('error-message')
const toTopButton = document.getElementById('to-top')
const outputOffset = document.getElementById('output-offset')

const displayStyle = document.getElementById('display-style')


//document.getElementById('filter-options').style.display = "none"


outputLimit.oninput = () => {
    limitDisplay.innerHTML = outputLimit.value
}

clearOuput.addEventListener('click', () => {
    toTopButton.style.visibility = "hidden"
    outputArea.innerHTML = ""
    errorArea.innerText = ""
    filePathElement.innerText = ""
})


btn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFolder()
    //console.log(filePath)
    if (filePath === undefined) filePath = "";
    errorArea.innerText = ""
    filePathElement.innerText = filePath
})

goButton.addEventListener('click', () => {
    if(filePathElement.innerText === "") { 
        showError("Please Select a folder to open");
        return;
    };

    if(displayStyle.value == "Seperate") {
        
        outputArea.innerHTML = ""
        errorArea.innerText = ""
    }
    
    imageFormats = []
    document.querySelectorAll("[data-image-format]").forEach(format => {
        if(format.checked) imageFormats.push(format.dataset.format)
    } )

    videoFormats = []
    document.querySelectorAll("[data-video-format]").forEach(format => {
        if(format.checked) videoFormats.push(format.dataset.format)
    })

    let filterObject = {
        directory: filePathElement.innerText,
        limit: outputLimit.value,
        offset: outputOffset.value,
        filter: {
            videos: {
                disabled: !videoEnable.checked,
                formats: videoFormats
            },
            images: {
                disabled: !imageEnable.checked,
                formats: imageFormats
            }
        }
    }

    //console.log(filterObject)

    //getFiles(filePathElement.innerText)
    getFiles(filterObject)
})


document.getElementById('to-top').addEventListener('click', () => {window.location.href = "#settings"})





const openMedia = (fullFile) => {
    let mediaWindow = window.open('./media-viewer.html')
    mediaWindow.loadFile(fullFile)
}



const openCarousel = (directory = filePathElement.innerText) => {
    window.carouselWindow.newInstance(directory)
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
            let finalIn = doFileChecks(files)
            if(!finalIn) break;
            formatFilesDefault(finalIn[0], finalIn[1], finalIn[2])
            toTopButton.style.visibility = "visible";
            break;
        case "Collection":
        case "Comic":
            openCarousel();
    }

})


window.electronAPI.errorMessage((_event, message) => {
    errorArea.innerText = message;
})



const doFileChecks = (files) => {
    //checks if the limit value is set to 0, if so then no limit is applied, otherwise there is a max value for the number of outputs
    let limit = Number(outputLimit.value)
    if(limit === 0) {limit = files.length - 1}

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

const allow_jpg = document.getElementById('format:allow-jpg')
const allow_png = document.getElementById('format:allow-png')
const allow_gif = document.getElementById('format:allow-gif')

const allow_mp4 = document.getElementById('format:allow-mp4')
const allow_webm = document.getElementById('format:allow-webm')
const allow_avi = document.getElementById('format:allow-avi')
const allow_mov = document.getElementById('format:allow-mov')
const allow_wmv = document.getElementById('format:allow-awmv')

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


const formatFilesDefault = (fileList, limit, start) => {

    if(fileList.length === 0) {
        showError("Your filter has resulted in zero files being output.")
        return;
    }
    let elementString;
    //console.log(fileList[0])
    //creates the outputs and places them into the output area if they exist
    for(let index = start; index < limit + start && fileList[index]; index++) {
        //console.log(index)
        //console.log(limit+start)
        switch(fileList[index].extension) {
            case ".mp4":
            case ".webm":
                if (!videoEnable.checked) continue
                elementString = `<video class="local-video file-output" src="${fileList[index].fullPath}" controls></video>`      
                break;
            case ".png":
            case ".jpg":
            case ".JPG":
            case ".PNG":
                if (!imageEnable.checked) continue
                elementString = `<img class='local-image file-output' src="${fileList[index].fullPath}">`                         
                break;
            case ".gif":
                if (!allow_gif.checked) continue;
                elementString = `<img class='local-image file-output' src="${fileList[index].fullPath}" repeat>`                               
                break;
            default:
                //console.log(`"${files[index].extension}" is not a supported file extension`)
                break;
        }

        outputArea.insertAdjacentHTML('beforeend', `<div class="output-container">${elementString}<p onclick="window.newWindow.specificNew(\`${new URL(fileList[index].fullPath)}\`)">Open</p></div>`)
    }

    if(outputArea.children.length === 0) {
        toTopButton.style.visibility = "hidden";
        showError("Your filter has resulted in no files being shown")
    }
}




const tryNew = () => {
    window.newWindow.specificEmpty()
}

