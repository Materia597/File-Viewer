const openMedia = document.getElementById('open-media')
const mediaContainer = document.getElementById('media-container')
const titleBox = document.getElementById('title-box')
const dateAdded = document.getElementById('date-added')

const convertButton = document.getElementById('convert')

const insertFile = (fullFile) => {
    console.log('received')

    console.log(fullFile)
    const path = fullFile.path
    const name = fullFile.name
    const extension = fullFile.extension
    const type = fullFile.type

    if(type === undefined) throw new Error("Type attribute has been set to undefined, this results in no source being displayed")

    switch(type) {
        case "image":
            if(extension === ".gif" || extension === ".webp") {
                mediaContainer.insertAdjacentHTML('beforeend', '<img id="specific-file" class="specific-file specific specific-gif" repeat>')
                break;
            }
            mediaContainer.insertAdjacentHTML('beforeend', '<img id="specific-file" class="specific-file specific specific-image">')
            break;
        case "video":
            mediaContainer.insertAdjacentHTML('beforeend', '<video id="specific-file" class="specific-file specific specific-video" controls></video>')
            break;
        case "audio":
            mediaContainer.insertAdjacentHTML('beforeend', '<audio id="specific-file" class="specific-file specific specific-audio" controls></audio>');
            break;
    }
    console.log("type:", type)

    console.log(`Path:\t${path}`)
    convertButton.addEventListener('click', () => {
        window.openNewWindow.newWindowWithOneFile('./file manipulation pages/convert format.html', path)
    })

    document.getElementById('specific-file').src = path
    //mediaContainer.src = path

    titleBox.innerHTML = name
}

async function getFile() {
    const fullFile = await window.newWindow.getFullFile()
    insertFile(fullFile)
}

getFile()