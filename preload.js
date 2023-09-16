const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping')
})

contextBridge.exposeInMainWorld('electronAPI', {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    getFiles: (direct) => ipcRenderer.send('files:getFiles', direct),
    receiveFiles: (callback) => ipcRenderer.on('files:receiveFiles', callback)
})

contextBridge.exposeInMainWorld('newWindow', {
    specificEmpty: () => ipcRenderer.send('open:specific-empty'),
    specificNew: (filePath) => ipcRenderer.send('open:specific-populated', filePath),
    fileReply: (callback) => ipcRenderer.on('reply:specific-file', callback),
    getFullFile: () => ipcRenderer.invoke('get:full-file')
})

contextBridge.exposeInMainWorld('carouselWindow', {
    newInstance: (directory) => ipcRenderer.send('new:carousel-window', directory),
    getData: () => ipcRenderer.send('get:carousel-data'),
    receiveData: (callback) => ipcRenderer.on('receive:carousel-data', callback)
})

contextBridge.exposeInMainWorld('changeFiles', {
    convert: (filePath, newFormat) => ipcRenderer.send('change:file:convert-format', filePath, newFormat)
})