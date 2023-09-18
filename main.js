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

    console.log(returnObject)

    return returnObject
}

ipcMain.on('files:getFiles', (_event, direct) => {
    console.log("received")
    
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
})


//--------------------------------------------------------------------------------------------------------------------
//Carousel window code

ipcMain.on('new:carousel-window', (_event, direct) => {
    carouselWindow()
    console.log(direct)
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

    console.log(filesFull)

    let validExtension = ['.gif', '.mp4', '.webm', '.png', '.jpg']

    let filesFiltered = []
    filesFull.forEach(file => {
        if(validExtension.includes((file.extension).toLowerCase())) {
            filesFiltered.push(file)
        }
    })
    console.log("----------------------------------------------------------")
    console.log(filesFiltered)

    if(filesFull.length === 0) _event.reply('error', "There are no files of acceptible type in the selected folder")

    _event.reply('receive:carousel-data', filesFiltered)
})



//--------------------------------------------------------------------------------------------------------------------
//Specific Window code

ipcMain.on('open:specific-empty', (_event) => {
    specificWindow()
})

ipcMain.on('open:specific-populated', (_event, file) => {
    specificWindow()
    const fullPath = decodeURI(file)
    const name = path.basename(fullPath)
    const ext = path.extname(name)

    let fileFull = {
        path: fullPath,
        name: name,
        extension: ext
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