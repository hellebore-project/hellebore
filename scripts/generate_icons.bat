magick -background none public/logo.svg -resize 25% public/favicon.ico
magick -background none public/logo.svg -resize 200% src-tauri/icons/icon.ico
magick -background none public/logo.svg -resize 400% src-tauri/icons/icon.icns
inkscape -w 512 -h 512 public/logo.svg -o src-tauri/icons/icon.png

inkscape -w 32 -h 32 public/logo.svg -o src-tauri/icons/32x32.png
inkscape -w 128 -h 128 public/logo.svg -o src-tauri/icons/128x128.png
inkscape -w 256 -h 256 public/logo.svg -o src-tauri/icons/128x128@2x.png

inkscape -w 30 -h 30 public/logo.svg -o src-tauri/icons/Square30x30Logo.png
inkscape -w 44 -h 44 public/logo.svg -o src-tauri/icons/Square44x44Logo.png
inkscape -w 71 -h 71 public/logo.svg -o src-tauri/icons/Square71x71Logo.png
inkscape -w 89 -h 89 public/logo.svg -o src-tauri/icons/Square89x89Logo.png
inkscape -w 107 -h 107 public/logo.svg -o src-tauri/icons/Square107x107Logo.png
inkscape -w 142 -h 142 public/logo.svg -o src-tauri/icons/Square142x142Logo.png
inkscape -w 150 -h 150 public/logo.svg -o src-tauri/icons/Square150x150Logo.png
inkscape -w 284 -h 284 public/logo.svg -o src-tauri/icons/Square284x284Logo.png
inkscape -w 310 -h 310 public/logo.svg -o src-tauri/icons/Square310x310Logo.png

inkscape -w 50 -h 50 public/logo.svg -o src-tauri/icons/StoreLogo.png