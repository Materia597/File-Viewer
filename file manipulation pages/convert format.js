console.log("convert format.js has started")
console.log(window.openNewWindow)

const imageGroup = document.getElementById('image-formats')
const movingImageGroup = document.getElementById('moving-image-formats')
const videoGroup = document.getElementById('video-formats')

imageGroup.style.display = "none"
movingImageGroup.style.display = "none"
videoGroup.style.display = "none"

const fileNameDisplay = document.getElementById("selected-file's-name")


const nameField = document.getElementById('name-of-copy')
const formatOption = document.getElementById('new-format-select')
const replaceOriginalCheckbox = document.getElementById('going-to-replace')


const confirmButton = document.getElementById('confirmation-button')
const cancelButton = document.getElementById('cancel-button')


const progressBar = document.getElementById('converting-progress')


/**
 * Changes the options available for the file depending on what kind of file it is (video, image, audio, etc.)
 */
const setupOptions = (mediaType, fileName) => {
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

    fileNameDisplay.innerText = fileName


}

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