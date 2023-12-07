const { app, BrowserWindow, ipcMain } = require('electron');
const { dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const { imageFormats, movingImageFormats, videoFormats, audioFormats } = require('./media file formats.js')


const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');


ffmpeg.setFfmpegPath(ffmpegStatic);


//find a better solution to this
let tempFullFileAccess;
let carouselSlidesFilter;

let temporaryFilesList;


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

/**
 * Takes files in specified directory and applies the provided filters
 * @param {object} filterObject The object containing the filters
 */
const getFilesByFilter = (filterObject) => {
    
    
    let directory = filterObject.directory
    
    
    //compiles all of the files formats in the filterObject into one list for easier use
    let fileFormats = []
    const fileTypes = ["videos", "images", "audio"]
    fileTypes.forEach(type => {
        if(!filterObject.filter[type].disabled) {
            filterObject.filter[type].formats.forEach(format => fileFormats.push(format))
        }
    })


    //gets all files in the specified directory, these are unfiltered
    let filesUnfiltered = fs.readdirSync(directory)
    let filteredFilesList = []

    //takes all the files in the unfiltered list, removes all files that do not have the formats from the list above, and creates objects for each of the remaining files
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
    
    //determines if there should be a limit applied to the number of files returned. If the limit is defined and not 0, then a limit is applied, otherwise no limit is applied
    if(fileOutputLimit === undefined || fileOutputLimit === 0) {
        filteredFilesWithLimit = filteredFilesList
    } else {
        filteredFilesWithLimit =  filteredFilesList.slice(0, fileOutputLimit)
    }

    //the object to be returned, containging the video, audio, and image formats. It also contains the list of files from the steps above
    let newFilter = {
        filteredFiles: filteredFilesWithLimit,
        videoFormats: filterObject.filter.videos.formats,
        imageFormats: filterObject.filter.images.formats,
        audioFormats: filterObject.filter.audio.formats
    }

    return newFilter
    //return filteredFilesList
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
})


//--------------------------------------------------------------------------------------------------------------------
//Carousel window code

ipcMain.on('new:carousel-window', (_event, filterObject) => {
    //carouselWindow()
    specifyWindow('./carousel/carousel-window.html')
    carouselSlidesFilter = filterObject
})

ipcMain.on('get:carousel-data', (_event) => {
    
    //let direct = decodeURI(carouselSlidesDirect)

    let filesFiltered = getFilesByFilter(carouselSlidesFilter)

    /*let files = fs.readdirSync(direct)
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
    })*/

   // if(filesFull.length === 0) _event.reply('error', "There are no files of acceptible type in the selected folder")

    _event.reply('receive:carousel-data', filesFiltered)
})

//--------------------------------------------------------------------------------------------------------------------
//Collection Window code








//--------------------------------------------------------------------------------------------------------------------
//Specific Window code

ipcMain.on('open:specific-empty', (_event) => {
    //specificWindow()
    specifyWindow('./specific file/media-viewer.html')
})

ipcMain.on('open:specific-populated', (_event, file, type) => {
    //specificWindow()
    specifyWindow('./specific file/media-viewer.html')

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

ipcMain.on('change:file:convert-format', (_event, filePath, newFormat, newName = "", newDirectory = "") => {
    if(videoFormats.includes(newFormat)) {
        //videoConvert(filePath, newFormat, _event)
        if(newName !== "" || newDirectory !== "") {
            videoConvertMoreOptions(filePath, newFormat, newName === "" ? path.parse(filePath).name : newName, newDirectory === "" ? path.dirname(filePath) : newDirectory, _event)
        }
        videoConvert(filePath, newFormat, _event)
        return
    }
    if(imageFormats.includes(newFormat)) {
        imageConvert(filePath, newFormat, _event)
        return
    }

    
})

//--------------------------------------------------------------------------------------------------------------------
//Format Changing

const videoConvert = (file, newFormat, _event) => {
    //console.log('function ran')
    //console.log(`${path.parse(file).name}${newFormat}`, `${path.resolve(path.dirname(file), path.parse(file).name + newFormat)}`)
    ffmpeg()
        .input(file)
        .saveToFile(`${path.resolve(path.dirname(file), path.parse(file).name + newFormat)}`)
        .on('progress', (progress) => {
            _event.reply('convert:progress', progress)
        })
        .on('end', () => {
            console.log('FFmpeg has finished')
            _event.reply('convert:complete', 0)
        })
        .on('error', (error) => {console.error(error)})
}

/**
 * 
 * @param {string} file 
 * @param {string} newFormat 
 * @param {string} newName 
 * @param {string} newDirectory 
 * @param {_event} _event 
 */
const videoConvertMoreOptions = (file, newFormat, newName, newDirectory, _event) => {
    ffmpeg()
        .input(file)
        .saveToFile(`${newDirectory}/${newName}.${newFormat}`)
        .on('progress', (progress) => {
            _event.reply('convert:progress', progress)
        })
        .on('end', () => {
            console.log('FFmpeg has finished')
            _event.reply('convert:complete', 0)
        })
        .on('error', (error) => {
            console.log(error)
        })
}

const imageConvert = (file, newFormat, _event) => {
    ffmpeg()
        .input(file)
        .addOption("-vframes 1")
        .saveToFile(`${path.resolve(path.dirname(file), path.parse(file).name + newFormat)}`)
        .on('progress', (progress) => {
            _event.reply('convert:progress', progress)
        })
        .on('end', () => {
            console.log("FFmpeg has finished")
            _event.reply('convert:complete', 0)
        })
        .on('error', (error) => {
            console.log(error)
        })
}



//--------------------------------------------------------------------------------------------------------------------
//Generalized Opening Windows

ipcMain.on('new-window:inititialize', (_event, filePath, directory) => {

    console.log('initializing')
    //open the new window
    specifyWindow(filePath)
})

let tempFileNameHolder

ipcMain.on('new-window:init-with-one', (_event, windowPath, fileName) => {
    tempFileNameHolder = fileName
    console.log(windowPath)
    specifyWindow(windowPath)
})

ipcMain.on('new-window:request-single-file', (_event) => {
    _event.reply('new-window:send-single-file', createFileObject(tempFileNameHolder))
    tempFileNameHolder = ""
})

ipcMain.on('new-window:filtered-initialize', (_event, windowPath, filterObject) => {
    //open the window last so it is certain that all operations are completed beforehand

    let filteredFiles = getFilesByFilter(filterObject)
    temporaryFilesList = filteredFiles;
    specifyWindow(windowPath)
})

ipcMain.on('new-window:request-file-list', (_event) => {
    
    let fileList = temporaryFilesList
    temporaryFilesList = []
    _event.reply('new-window:send-file-list', fileList)
})



//--------------------------------------------------------------------------------------------------------------------


const createFileObject = (filePath) => {
    return {
        fullPath: filePath,
        name: path.basename(filePath),
        extension: path.extname(filePath),
        fullName: path.basename(filePath) + path.extname(filePath)
    }
}


//--------------------------------------------------------------------------------------------------------------------
//Window types

const availableWindows = [
    './home/index.html',
    './specific file/media-viewer.html',
    './carousel/carousel-window.html',
    './collection/collection-window.html',
    './file manipulation pages/convert format.html'
]

exports.availableWindows = availableWindows


/**
 * Creates a new window with the file location specified.
 * @param {string} windowPath The path of the file to open.
 * @throws {Error} If path is not an allowed location.
 */
const specifyWindow = (windowPath) => {
    
    console.log('activated')
    
    if(typeof(windowPath) !== "string") throw new TypeError("Path must be a string")
    //if(!availableWindows.includes(windowPath)) throw new Error("Path must belong to pre-specified parameters");

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        webPreferences: {
            preload: path.join(__dirname, './preload.js')
        }
    })

    console.log(windowPath)

    win.loadFile(windowPath)
}

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
    win.loadFile('./home/index.html')
}

//--------------------------------------------------------------------------------------------------------------------
//Electron stuff
app.whenReady().then(() => {
    ipcMain.handle('dialog:openFolder', handleFolderOpen)
    ipcMain.handle('dialog:openFile', handleFileOpen)
    ipcMain.handle('ping', () => 'pong')
    ipcMain.handle('get:full-file', () => tempFullFileAccess)

    ipcMain.handle('data/formats:videos', () => videoFormats)
    ipcMain.handle('data/formats:audio', () => audioFormats)
    ipcMain.handle('data/formats:images', () => imageFormats)
    ipcMain.handle('data/formats:moving_images', () => movingImageFormats)  




    createWindow()
    //specifyWindow('./file manipulation pages/convert format.html')
    //mainWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow() // mainWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit()
})