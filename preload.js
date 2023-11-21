const { contextBridge, ipcRenderer } = require('electron')

//const {availableWindows} = require("./main.js")

const availableWindows = [
    './home/index.html',
    './specific file/media-viewer.html',
    './carousel/carousel-window.html',
    './collection/collection-window.html',
    './file manipulation pages/convert format.html'
]


contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping')
})

//for main window
contextBridge.exposeInMainWorld('electronAPI', {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    getFiles: (direct) => ipcRenderer.send('files:getFiles', direct),
    receiveFiles: (callback) => ipcRenderer.on('files:receiveFiles', callback),
    errorMessage: (callback) => ipcRenderer.on('error', callback)
})

//for specific window
contextBridge.exposeInMainWorld('newWindow', {
    specificEmpty: () => ipcRenderer.send('open:specific-empty'),
    specificNew: (filePath, type) => ipcRenderer.send('open:specific-populated', filePath, type),
    fileReply: (callback) => ipcRenderer.on('reply:specific-file', callback),
    getFullFile: () => ipcRenderer.invoke('get:full-file')
})

//for carousel window
contextBridge.exposeInMainWorld('carouselWindow', {
    newInstance: (filterObject) => ipcRenderer.send('new:carousel-window', filterObject),
    getData: () => ipcRenderer.send('get:carousel-data'),
    receiveData: (callback) => ipcRenderer.on('receive:carousel-data', callback)
})

//for collection window
contextBridge.exposeInMainWorld('collectionWindow', {
    newInstance: (directory) => ipcRenderer.send('new:collection-window', directory),
    getData: () => ipcRenderer.send('get:collection-data')
})

contextBridge.exposeInMainWorld('openNewWindow', {
    newWindow: (filePath, directory) => {
        if(!availableWindows.includes(filePath)) throw new Error("filePath is not allowed")
        console.log('sending')
        ipcRenderer.send('new-window:inititialize', filePath, directory)
    },
    newWindowWithMultipleFiles: (windowPath, filterObject) => {
        //if(!availableWindows.includes(windowPath)) throw new Error("specified windowPath is not allowed")
        ipcRenderer.send('new-window:filtered-initialize', windowPath, filterObject) 
    },
    requestFileList: () => {
        ipcRenderer.send('new-window:request-file-list')
    },
    receiveFileList: (callback) => {
        ipcRenderer.on('new-window:send-file-list', callback)
    }
})


//for file conversion (to be added)
contextBridge.exposeInMainWorld('changeFiles', {
    convert: (filePath, newFormat) => ipcRenderer.send('change:file:convert-format', filePath, newFormat)
})