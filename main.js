const { app, BrowserWindow, ipcMain } = require('electron');
const { dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');


ffmpeg.setFfmpegPath(ffmpegStatic);


let tempFullFileAccess;
let carouselSlidesDirect;



async function handleFolderOpen() {
    const {canceled, filePaths} = await dialog.showOpenDialog({properties: ['openDirectory']})
    if (!canceled) {
        return filePaths[0]
    }
}

async function handleFileOpen() {
    const {canceled, filePaths} = await dialog.showOpenDialog()
    if(canceled) return

    let fullPath = path.resolve(filePaths[0])
    let name = path.basename(fullPath)
    let extension = path.extname(name)

    let returnObject = {
        fullPath: fullPath,
        name: name,
        extension: extension
    }

    //console.log(returnObject)

    return returnObject
}

const getFilesByFilter = (filterObject) => {
    let directory = filterObject.directory
    let fileFormats = []

    if(!filterObject.filter.videos.disabled) {
        filterObject.filter.videos.formats.forEach(format => fileFormats.push(format))
    }
    if(!filterObject.filter.images.disabled) {
        filterObject.filter.images.formats.forEach(format => fileFormats.push(format))
    }
    if(!filterObject.filter.audio.disabled) {
        filterObject.filter.audio.formats.forEach(format => fileFormats.push(format))
    }

    let filesUnfiltered = fs.readdirSync(directory)
    let filteredFilesList = []

    for(let index = 0; index < filesUnfiltered.length; index++) {
        let file = filesUnfiltered[index]
        let fullPath = path.resolve(directory, file)
        let extension = path.extname(fullPath)
        if(fileFormats.includes(extension.toLowerCase())) {
            filteredFilesList.push(
                {
                    fullPath: fullPath,
                    name: file,
                    extension: extension
                }
            )
        }
    }

    let fileOutputLimit = filterObject.limit
    let filteredFilesWithLimit;
    
    
    if(fileOutputLimit === undefined || fileOutputLimit === 0) {
        filteredFilesWithLimit = filteredFilesList
    } else {
        filteredFilesWithLimit =  filteredFilesList.slice(0, fileOutputLimit)
    }

    return {
        filteredFiles: filteredFilesWithLimit,
        videoFormats: filterObject.filter.videos.formats,
        imageFormats: filterObject.filter.images.formats,
        audioFormats: filterObject.filter.audio.formats
    }
    //return filteredFilesList
}

const getFilesByAdvancedFilter = (filterObject) => {
    let directory = fileObject.directory
    
    let fileFormats = []
    if(!filterObject.filter.videos.disabled) {
        filterObject.filter.videos.formats.forEach(format => fileFormats.push(format))
    }
    if(!filterObject.filter.images.disabled) {
        filterObject.filter.images.formats.forEach(format => fileFormats.push(format))
    }

    let unfilteredFiles = fs.readdirSync(directory)
    let filteredFiles = []
    let numOfVideoFiles = 0
    let numOfImageFiles = 0
    unfilteredFiles.forEach(file => {
        let fullPath = path.resolve(directory, file)
        let extension = path.extname(fullPath)
        if(fileFormats.includes(extension)) {
            filteredFiles.push({
                fullPath: fullPath,
                name: file,
                extension: extension
            })
            if(filterObject.filter.videos.formats.includes(extension)) numOfVideoFiles++
            if(filterObject.filter.images.formats.includes(extension)) numOfImageFiles++
        }
    })


    return {
        number_of_videos: numOfVideoFiles,
        number_of_images: numOfImageFiles,
        fileList: filteredFiles
    }
}



/*
    {
        directory: direct,
        limit: num \(if 0 then nothing applied\),
        filter: {
            videos: {
                disabled: false,
                formats: [".mp4", ".webm"]
            },
            images: {
                disabled: false,
                formats: [".jpg", ".png", ".gif"]
            }
        }
    }
*/


ipcMain.on('files:getFiles', (_event, filter) => {
    
    _event.reply('files:receiveFiles', getFilesByFilter(filter))
    return;
    
    //Legacy, no filter implementation
    /*
    let files = fs.readdirSync(direct)
    let filePaths = []
    files.forEach(file => {
        filePaths.push(
            {
                fullPath: path.resolve(direct, file),
                name: file,
                extension: path.extname(file)
            }
        )
    })

    //console.log(filePaths)
    _event.reply('files:receiveFiles' ,filePaths )
    */
})


//--------------------------------------------------------------------------------------------------------------------
//Carousel window code

ipcMain.on('new:carousel-window', (_event, direct) => {
    carouselWindow()
    carouselSlidesDirect = direct
})

ipcMain.on('get:carousel-data', (_event) => {
    
    let direct = decodeURI(carouselSlidesDirect)

    let files = fs.readdirSync(direct)
    let filesFull = []
    files.forEach(file => {
        filesFull.push({
            fullPath: path.resolve(direct, file),
            name: file,
            extension: path.extname(file)
        })
    })


    let validExtension = ['.gif', '.mp4', '.webm', '.png', '.jpg']

    let filesFiltered = []
    filesFull.forEach(file => {
        if(validExtension.includes((file.extension).toLowerCase())) {
            filesFiltered.push(file)
        }
    })

    if(filesFull.length === 0) _event.reply('error', "There are no files of acceptible type in the selected folder")

    _event.reply('receive:carousel-data', filesFiltered)
})



//--------------------------------------------------------------------------------------------------------------------
//Specific Window code

ipcMain.on('open:specific-empty', (_event) => {
    specificWindow()
})

ipcMain.on('open:specific-populated', (_event, file, type) => {
    specificWindow()
    const fullPath = decodeURI(file)
    const name = path.basename(fullPath)
    const ext = path.extname(name)

    let fileFull = {
        path: fullPath,
        name: name,
        extension: ext,
        type: type
    }

    tempFullFileAccess = fileFull

    //_event.reply('reply:specific-file', fileFull)
    //console.log('sent')
})

ipcMain.on('change:file:convert-format', (_event, filePath, newFormat) => {
    videoConvert(filePath, newFormat)
})



const videoConvert = (file, newFormat) => {
    return;
    //console.log('function ran')
    //console.log(`${path.parse(file).name}${newFormat}`, `${path.resolve(path.dirname(file), path.parse(file).name + newFormat)}`)
    ffmpeg()
        .input(file)
        .saveToFile(`${path.resolve(path.dirname(file), path.parse(file).name + newFormat)}`)
        .on('progress', (progress) => {
            //console.log(`Processing: ${Math.floor(progress.percent)}% done`)
        })
        .on('end', () => console.log('FFmpeg has finished'))
        .on('error', (error) => {console.error(error)})
}

//--------------------------------------------------------------------------------------------------------------------
//Window types
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

const specificWindow = () => {
    const specWin = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        webPreferences:{
            preload: path.join(__dirname, 'preload.js')
        }
    })

    specWin.loadFile('media-viewer.html')
}

const carouselWindow = () => {
    const carWin = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    carWin.loadFile('carousel-window.html')
}


//--------------------------------------------------------------------------------------------------------------------
//Electron stuff
app.whenReady().then(() => {
    ipcMain.handle('dialog:openFolder', handleFolderOpen)
    ipcMain.handle('dialog:openFile', handleFileOpen)
    ipcMain.handle('ping', () => 'pong')
    ipcMain.handle('get:full-file', () => tempFullFileAccess)
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit()
})