#pragma bank 1

#include "FadeManager.h"
#include <gb/cgb.h>
#include <string.h>
#include "Palette.h"
#include "Math.h"
#include "data_ptrs.h"

static UBYTE fade_frame;
static FADE_DIRECTION fade_direction;

static const UBYTE obj_fade_vals[] = {0x00, 0x00, 0x40, 0x80, 0x90, 0xD0, 0xD0};
static const UBYTE bgp_fade_vals[] = {0x00, 0x00, 0x40, 0x90, 0xA4, 0xE4, 0xE4};
// Custom third fade hack--
static const UBYTE obj_fade_partial_vals[] = {0x40, 0x40, 0x80, 0x90, 0x90, 0xD0, 0xD0};
static const UBYTE bgp_fade_partial_vals[] = {0x50, 0x50, 0x90, 0x90, 0xA4, 0xE4, 0xE4};
// ------------------------

static const UBYTE obj_fade_black_vals[] = {0xFF, 0xFF, 0xF8, 0xE4, 0xD4, 0xD0, 0xD0};
static const UBYTE bgp_fade_black_vals[] = {0xFF, 0xFF, 0xFE, 0xE9, 0xE5, 0xE4, 0xE4};

#ifdef CGB
UWORD UpdateColorBlack(UINT8 i, UWORD col) {
  return RGB2(DespRight(PAL_RED(col), 5 - i),  DespRight(PAL_GREEN(col), 5 - i),
              DespRight(PAL_BLUE(col), 5 - i));
}

void ApplyPaletteChangeColor(UBYTE index) {
  UINT8 c;
  //UWORD paletteWhite; //Unused by DMG-style fades on CGB
  UWORD* col = BkgPalette;
  
  // DMG-style fades on CGB. -------------
  UINT8 pi; //palette index
  UBYTE coltype; //0~3 from lightest to darkest
  UBYTE* bgpalette; //which DMG palettes shall we use?
  UBYTE* objpalette;
  // -------------------------------------

  if (index == 5) {
    memcpy(BkgPaletteBuffer, BkgPalette, 64);
    memcpy(SprPaletteBuffer, SprPalette, 64);
    palette_dirty = TRUE;
    return;
  }
  
  /*if (fade_style) {
    for (c = 0; c != 32; ++c, ++col) {
      BkgPaletteBuffer[c] = UpdateColorBlack(index, *col);
    }
    col = SprPalette;
    for (c = 0; c != 32; c++, ++col) {
      SprPaletteBuffer[c] = UpdateColorBlack(index, *col);
    }
  } else { 
    paletteWhite = RGB2(DespRight(0x1F, index), DespRight(0x1F, index), 
                      DespRight(0x1F, index));
    for (c = 0; c != 32; ++c, ++col) {
      BkgPaletteBuffer[c] = (UWORD)*col | paletteWhite;
    }
    col = SprPalette;
    for (c = 0; c != 32; ++c, ++col) {
      SprPaletteBuffer[c] = (UWORD)*col | paletteWhite;
    }
  }*/
  // DMG-style fades on CGB. -------------
  if(fade_style == 1) {
	bgpalette = (UBYTE*)bgp_fade_black_vals;
	objpalette = (UBYTE*)obj_fade_black_vals;
  } else if(fade_style == 2) {
	bgpalette = (UBYTE*)bgp_fade_partial_vals;
	objpalette = (UBYTE*)obj_fade_partial_vals;
  } else {
	bgpalette = (UBYTE*)bgp_fade_vals;
	objpalette = (UBYTE*)obj_fade_vals;
  }
  for(c = 0; c < 8; ++c) {
	for(pi = 0; pi < 4; ++pi) {
		coltype = (bgpalette[index] & (0x03 << (pi*2))) >> (pi*2);
		BkgPaletteBuffer[c*4 + pi] = (UWORD)(col[c*4 + coltype]);
	}
  }
  //col = SprPalette;
  //Keep using the background palettes, so that sprites can use the dark green part of the palette.
  //Make sure sprite and background palettes are the same!
  for(c = 0; c < 8; ++c) {
	for(pi = 0; pi < 4; ++pi) {
		coltype = (objpalette[index] & (0x03 << (pi*2))) >> (pi*2);
		SprPaletteBuffer[c*4 + pi] = (UWORD)(col[c*4 + coltype]);
	}
  }
  // END DMG-style fades on CGB ----------

  palette_dirty = TRUE;
}
#endif

void ApplyPaletteChangeDMG(UBYTE index) {
  //if (!fade_style) {
  // Custom third fade hack--
  if (fade_style == 0) {
  // ------------------------
    OBP0_REG = obj_fade_vals[index];
    BGP_REG = bgp_fade_vals[index];
  }
  // Custom third fade hack--
  else if(fade_style == 2) {
	OBP0_REG = obj_fade_partial_vals[index];
    BGP_REG = bgp_fade_partial_vals[index];
  }
  // ------------------------
  else {
    OBP0_REG = obj_fade_black_vals[index];
    BGP_REG = bgp_fade_black_vals[index];
  }
}

void FadeIn_b() __banked {
  fade_frame = 0;
  fade_direction = FADE_IN;
  fade_running = TRUE;
  fade_timer = 0;
#ifdef CGB
  if (_cpu == CGB_TYPE) {
    ApplyPaletteChangeColor(fade_timer);
  } else
#endif
    ApplyPaletteChangeDMG(fade_timer);
}

void FadeOut_b() __banked {
  fade_frame = 0;
  fade_direction = FADE_OUT;
  fade_running = TRUE;
  fade_timer = 5;
#ifdef CGB
  if (_cpu == CGB_TYPE) {
    ApplyPaletteChangeColor(fade_timer);
  } else
#endif
    ApplyPaletteChangeDMG(fade_timer);
}

void FadeUpdate_b()  __banked {
  if (fade_running) {
    if ((fade_frame & fade_frames_per_step) == 0) {
      if (fade_direction == FADE_IN) {
        fade_timer++;
        if (fade_timer == 5) {
          fade_running = FALSE;
        }
      } else {
        fade_timer--;
        if (fade_timer == 0) {
          fade_running = FALSE;
        }
      }
#ifdef CGB
      if (_cpu == CGB_TYPE) {
        ApplyPaletteChangeColor(fade_timer);
      } else
#endif
        ApplyPaletteChangeDMG(fade_timer);
    }
    fade_frame++;
  }
}

void ApplyPaletteChange_b() __banked {
#ifdef CGB
  if (_cpu == CGB_TYPE) {
    ApplyPaletteChangeColor(fade_timer);
  } else
#endif
    ApplyPaletteChangeDMG(fade_timer);
}

