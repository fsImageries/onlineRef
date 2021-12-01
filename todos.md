# Todos

## Porting Todos

- [x] implement 'add files' methods (drag&drop[files, links], upload, linkinput)
- [x] toolbuttons design
- [x] actual buttons and functions
- [x] keypresses and shortcuts!!
- [x] video function
- [x] stage zoom
- [x] guides/magnet snap, rotation snap

## Big Ones

- [ ] save function for stage
- [ ] write up fucking help menu and tooltips!
- [ ] layout function to space images in grid layout

## App Todos

- [ ] show image on canvas while dragging it in (maybe not possible)
- [x] make transformer optional, defaults to no transforms only pure dragging
- [x] scale images according to pointer position when droped
- [ ] links without protocol fail on import (they fail hard, need to catch)
- [ ] import fails in general kill the app
- [x] settingsAll buttons got some stuff overhanging
- [x] need to calculate pointer x/y on moved canvas
- [x] need to calculate pointer for selection rect on moved canvas
- [x] default settings into localstorage (build settings window)
- [x] use 'moveToTop' for foreground change (list reordering is the solution)
- [x] fashion up the dropZone
- [x] build pause and play button for videos
- [x] collect stage attributes (eg rotateFree) into single object
- [ ] mobile zoom
- [x] make videobutton functional
- [ ] seperate videobutton pause from hover activation to make it persitant, also for menu playbutton
- [ ] build settings reducer to manage setting and getting stored settings
- [ ] refine stage import, scaled images don't load correctly
- [x] forgot to activate menu playbutton

### Ideas

- [ ] clipping mask for image
- [ ] snap grid https://medium.com/@pierrebleroux/snap-to-grid-with-konvajs-c41eae97c13f

## Keycodes

- [x] `ctrl + d` = duplicate node(s)
- [ ] `ctrl + c && v` = copy & paste node(s)
- [x] `ctrl + i` = open import dialog
- [x] `i` = open link field
- [x] `Backspace, Delete` = delete node(s)
- [x] `q` = toggle menu
- [x] `t` = toggle transform
- [x] `r` = toggle rotate
- [x] `m` = move to top
- [x] `d` = toggle stage drag
- [x] `g` = toggle guides
- [x] `rotate + hold shift` = free rotate (no snap)
- [x] `zoom + hold shift` = zoom in steps

## Stage Settings

- [x] stage background color
- [x] show guides when snapping
