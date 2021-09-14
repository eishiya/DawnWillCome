# Dawn Will Come
This repository contains the GB Studio project files for Dawn Will Come, an entry for the GBCompo21 by eishiya, H0lyhandgrenade, and C_DOS_KEZ.
The project was made in GBS 2.0 beta5, and may not work in other versions.

## Engine mods
Dawn Will Come uses some engine mods in addition to scripts created via the IDE:
- rulz's UI Interactable hack, to allow text boxes to not block input, modified for 2.0.0-e18.
- HP Display mod, which allows automatically generating HP containers based on variables.
- A hack to add a partial fade option. This is used for brief flashes in combat, and should not be used for transitions.
- Precise Sounds mod, which allows greater control over the sound effects in GBS. This is used for some of the sound effects.
- A hack to disable the automatic hiding of actors when they are overlapped by dialogue windows. This allows the speech bubble tail effect in dialogue scenes.
- The code to move the player in Top Down mode is all commented out to prevent the invisible player from moving around.
- A hack to load some variables from a save when checking If Save Is Loaded. This allows collectibles to be accessible prior to loading the save data and to carry over across playthroughs (thanks to pautomas).
- A hack to make fades in Color Mode behave like DMG fades, using the four colours of the palette without changing them. It only works correctly for monochrome games because it assumes sprite palettes are the same as background palettes. Due to a bug in the version of gbdk2020 GBS uses, in Color Mode, this fade can leave some black tiles on the screen during fades.
- The limit on how many On Init events can run within a single frame is reduced to compensate for heavy switches, to prevent stack overflow.
- Engine-level timer to allow tracking the total time spent playing.

## Licenses
The artwork and music are licenced under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
Artwork © H0lyhandgrenade and eishiya
Music © Kezia Salmon


All of the code, including the scripts built in the IDE, are licenced under the MIT license.
```
Original GBS engine code © 2020 Chris Maltby
Dawn Will Come-specific code © 2021 eishiya

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```