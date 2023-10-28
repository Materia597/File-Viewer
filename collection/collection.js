const comicList = document.getElementById('comic-holder')

const getFiles = () => {
    window.openNewWindow.requestFileList()
}

window.openNewWindow.receiveFileList((_event, fileList) => {
    
    fileList.filteredFiles.forEach(file => {
        let extension = file.extension.toLowerCase()
        let componentString = ""
        if(fileList.videoFormats.includes(extension)) {
            componentString = `<video src="${file.fullPath}" controls></video>`
        }
        if(fileList.imageFormats.includes(extension)) {
            componentString = `<img src="${file.fullPath}" `
            if(extension === ".webp" || extension === ".gif") componentString += "repeat"
            componentString += "/>"
        }

        comicList.insertAdjacentHTML('beforeend', componentString)
    })


})

getFiles();