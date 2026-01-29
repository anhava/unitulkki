# DreamAI Icon Design Assets

This folder contains SVG design files for the DreamAI app icons and splash screen.

## Files

- `icon.svg` - Main app icon (1024x1024) with full branding
- `splash-icon.svg` - Splash screen icon (512x512) with logo and tagline
- `adaptive-icon.svg` - Android adaptive icon foreground (1024x1024)

## Color Palette

- Primary Purple: `#8B5CF6`
- Dark Purple: `#6D28D9`
- Background Start: `#1a0a2e`
- Background End: `#0a0118`
- Accent Gold: `#F59E0B`

## Export Instructions

### Using Inkscape (Free)

```bash
# Install Inkscape
# macOS: brew install inkscape
# Ubuntu: sudo apt install inkscape

# Export icon.svg to PNG
inkscape icon.svg -w 1024 -h 1024 -o ../images/icon.png

# Export splash-icon.svg to PNG
inkscape splash-icon.svg -w 512 -h 512 -o ../images/splash-icon.png

# Export adaptive-icon.svg to PNG
inkscape adaptive-icon.svg -w 1024 -h 1024 -o ../images/adaptive-icon.png
```

### Using ImageMagick

```bash
# Install ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt install imagemagick

# Convert SVG to PNG
convert -background none icon.svg -resize 1024x1024 ../images/icon.png
convert -background none splash-icon.svg -resize 512x512 ../images/splash-icon.png
convert -background none adaptive-icon.svg -resize 1024x1024 ../images/adaptive-icon.png
```

### Using Figma/Sketch

1. Open the SVG file in Figma or Sketch
2. Export as PNG at the required dimensions
3. Save to `assets/images/`

## Required Sizes

| File | Size | Description |
|------|------|-------------|
| icon.png | 1024x1024 | iOS App Icon |
| adaptive-icon.png | 1024x1024 | Android Adaptive Icon Foreground |
| splash-icon.png | 512x512 | Splash Screen Center Icon |
| favicon.png | 48x48 | Web Favicon |

## Design Notes

- The moon crescent represents dreams and the night
- Stars represent AI interpretation and insight
- Purple gradient connects to the app's glassmorphism theme
- The design works well on both light and dark backgrounds
