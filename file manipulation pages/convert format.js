const imageGroup = document.getElementById('image-formats')
const movingImageGroup = document.getElementById('moving-image-formats')
const videoGroup = document.getElementById('video-formats')

imageGroup.style.display = "none"
movingImageGroup.style.display = "none"
videoGroup.style.display = "none"

const fileNameDisplay = document.getElementById("selected-files-name")

const formatOption = document.getElementById('new-format-select')


const confirmButton = document.getElementById('confirmation-button')
const cancelButton = document.getElementById('cancel-button')


const progressBar = document.getElementById('converting-progress')
const progressLabel = document.getElementById('progress-label')

const mediaPreviewContainer = document.getElementById('media-preview')

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

    getFile()
}

assignFormatValues()

let currentFile = {}


/**
 * Changes the options available for the file depending on what kind of file it is (video, image, audio, etc.)
 * @param {string} mediaType The media type of the file (video, image, etc.)
 * @param {string} fileName The name of the file
 */
const setupOptions = (mediaType, filePath) => {
    switch(mediaType) {
        case "image":
            imageGroup.style.display = "initial"
            mediaPreviewContainer.insertAdjacentHTML('beforeend', `<img class="preview" src="${filePath}">`)
            break;
        case "moving image":
            movingImageGroup.style.display = "initial"
            mediaPreviewContainer.insertAdjacentHTML('beforeend', `<img class="preview" src=\`${filePath}\` repeat>`)
            break;
        case "video":
            videoGroup.style.display = "initial"
            mediaPreviewContainer.insertAdjacentHTML('beforeend', `<video class="preview" src="${new String(filePath)}" controls></video>`)
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
    fileNameDisplay.innerText = file.name

    currentFile = file
    let type = ""

    console.log("ok")

    let extension = file.extension.toLowerCase()
    if(videoFormats.includes(extension)) type = "video"
    if(imageFormats.includes(extension)) type = "image"
    if(movingImageFormats.includes(extension)) type = "moving image"

    setupOptions(type, file.fullPath)
    isMatchingFormat(extension)


})

const isMatchingFormat = (format) => {
    let shortened = format.replace(/\./g, '')
    if(document.querySelector(`option[value="convert:${shortened}"]`)) {
        document.querySelector(`option[value="convert:${shortened}"]`).selected = true
    }
}





window.convertion.convertionProgress((_event, progress) => {
    console.log(progress)
    progressBar.value = progress.percent
    progressLabel.innerHTML = `${Math.round(progress.percent)}%`
})

window.convertion.convertionComplete((_event, dummy) => {
    //console.log("Conversion Complete")
    progressBar.value = 100
    window.alert("Conversion Complete")
})

confirmButton.addEventListener('click', () => {
    let newFormat = formatOption.value
    window.changeFiles.convert(currentFile.fullPath, newFormat)
})


const convertRaw = (filePath, newFormat, newName, newDirectory) => {
    window.convertion.convertVideo(filePath, newFormat, newName, newDirectory)
}