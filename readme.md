# File Viewer

Allows you to select a folder on your computer and see the media files inside of it in a grid. Supported file types:

 - .mp4, .webm, .mkv, .mov
 - .jpg, .png
 - .gif, .webp

## Usage

Press the "Select" button at the top and select a directory on the computer, then configure your filter below. Once you have done that, you click "Go" and the files will be placed in the area below according the filter selected. 


More formats and features will be added later.

## Updates

Code has somewhat been tidied, so unused functions have been removed and code refactored to be more readable. Some documentation for the function that returns a list of files from a filter.

## New Additions:

- Audio is not supported in the Carousel, but there needs to be some changes
- All files in Separate Windows nnow have the same height, audio needs to be fixed so it does nnot appear at top or bottom
- Create distinct uses for "Collection" and "Comic" display options, names were also changed
- Collection now refers to the carousel
- Comic now refers to a list of all the files vertically
- Some printing is supported in the comic window

## Features to add:

- See the date that the file was created in the Specific Window
- Be able to create copies of files with different formats in Specific Window
- Pages to the "Separate" display type, so that if a folder has a lot of files they are not all loaded at once
- Add an option to select multiple folders at once (Optional)