console.log("convert format.js has started")
console.log(window.openNewWindow)

const imageGroup = document.getElementById('image-formats')
const movingImageGroup = document.getElementById('moving-image-formats')
const videoGroup = document.getElementById('video-formats')

imageGroup.style.display = "none"
movingImageGroup.style.display = "none"
videoGroup.style.display = "none"

const fileNameDisplay = document.getElementById("selected-files-name")


const nameField = document.getElementById('name-of-copy')
const formatOption = document.getElementById('new-format-select')
const replaceOriginalCheckbox = document.getElementById('going-to-replace')


const confirmButton = document.getElementById('confirmation-button')
const cancelButton = document.getElementById('cancel-button')


const progressBar = document.getElementById('converting-progress')



const videoFormats = ['.webm', '.mp4', '.avi', 'mkv']
const imageFormats = ['.jpg', '.jpeg', '.png']
const movingImageFormats = ['.gif', '.webp']
const audioFormats = ['.mp3', '.ogg']



/**
 * Changes the options available for the file depending on what kind of file it is (video, image, audio, etc.)
 * @param {string} mediaType The media type of the file (video, image, etc.)
 * @param {string} fileName The name of the file
 */
const setupOptions = (mediaType) => {
    switch(mediaType) {
        case "image":
            imageGroup.style.display = "initial"
            break;
        case "moving image":
            movingImageGroup.style.display = "initial"
            break;
        case "video":
            videoGroup.style.display = "initial"
            break;
        default:
            console.error("No Option was chosen")
            break;
    }
}

const getFile = () => {
    window.openNewWindow.requestSingleFile()
}

window.openNewWindow.receiveSingleFile((_event, file) => {
    console.log(file)
    fileNameDisplay.innerText = file.name

    let type = ""

    let extension = file.extension.toLowerCase()
    if(videoFormats.includes(extension)) type = "video"
    if(imageFormats.includes(extension)) type = "image"
    if(movingImageFormats.includes(extension)) type = "moving image"
    
    setupOptions(type)

    isMatchingFormat(extension)

})

const isMatchingFormat = (format) => {
    let shortened = format.replace(/\./g, '')
    if(document.querySelector(`option[value="convert:${shortened}"]`)) {
        document.querySelector(`option[value="convert:${shortened}"]`).selected = true
    }
}

getFile()



window.convertion.convertionProgress((_event, progress) => {
    console.log(progress)
    progressBar.value = progress.percent
})

window.convertion.convertionComplete((_event, dummy) => {
    console.log("Conversion Compelte")
    progressBar.value = 100
})


const convertRaw = (filePath, newFormat) => {
    window.convertion.convertVideo(filePath, newFormat)
}