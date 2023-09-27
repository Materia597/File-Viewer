const openMedia = document.getElementById('open-media')
const mediaContainer = document.getElementById('media-container')
const titleBox = document.getElementById('title-box')
const dateAdded = document.getElementById('date-added')



const insertFile = (fullFile) => {
    console.log('received')

    console.log(fullFile)
    const path = fullFile.path
    const name = fullFile.name
    const extension = fullFile.extension

    switch(extension) {
        case '.jpg':
        case '.JPG':
        case '.png':
        case '.PNG':
            mediaContainer.insertAdjacentHTML('beforeend', '<img id="specific-file" class="specific-file specific specific-image">')
            break;
        case '.mp4':
        case '.webm':
            mediaContainer.insertAdjacentHTML('beforeend', '<video id="specific-file" class="specific-file specific specific-image" controls></video>')
            break;
        case '.gif':
            mediaContainer.insertAdjacentHTML('beforeend', '<img id="specific-file" class="specific-file specific specific-gif" repeat>')
            break;
    }

    document.getElementById('specific-file').src = path

    titleBox.innerHTML = name
}

async function getFile() {
    const fullFile = await window.newWindow.getFullFile()
    insertFile(fullFile)
}

getFile()