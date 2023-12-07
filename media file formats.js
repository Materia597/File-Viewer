/*  
    TODO:
    use the formats exported along with the new way to retrieve them in main.js to keep from remaking arrays in each file for file formats
*/



// These should be the formats that are supported in the program
// They should be exported and used throughout the project
// If new formats are discovered and need to be added, add the string in one of these arrays
const imageFormats = ['.jpg', '.jpeg', '.png']
const movingImageFormats = ['.gif', '.webp']
const videoFormats = ['.mp4', '.webm', '.mkv', '.avi']
const audioFormats = ['.mp3', '.ogg']

exports.imageFormats = imageFormats
exports.movingImageFormats = movingImageFormats
exports.videoFormats = videoFormats
exports.audioFormats = audioFormats