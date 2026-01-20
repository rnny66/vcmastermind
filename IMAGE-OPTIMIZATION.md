# Image Optimization Recommendations

## Current Status

The website has been updated to use the new professional images of Anieke:
- **anieke-2.jpg** - Used in hero section on home.html
- **anieke-1.jpg** - Used in about section on home.html

## ⚠️ Important: Image File Sizes

Both images are currently **TOO LARGE** for optimal web performance:

- `anieke-1.jpg`: **7.1 MB** (current)
- `anieke-2.jpg`: **10.2 MB** (current)

**Target sizes for web:**
- `anieke-1.jpg`: ~200-300 KB (goal)
- `anieke-2.jpg`: ~200-300 KB (goal)

## Recommended Optimization Steps

### Option 1: Online Tools (Easiest)

Use one of these free online services:

1. **Squoosh** (https://squoosh.app/)
   - Drag and drop your image
   - Resize to recommended dimensions below
   - Adjust quality slider to 80-85%
   - Download optimized version

2. **TinyPNG** (https://tinypng.com/)
   - Upload your JPG files
   - Automatic smart compression
   - Download compressed versions

3. **Optimizilla** (https://imagecompressor.com/)
   - Upload multiple images at once
   - Preview quality before download

### Option 2: Photoshop / Image Editor

If you have Adobe Photoshop or similar:

**For anieke-2.jpg (Hero Image):**
1. Resize to: 1000px width (height auto)
2. Export as: JPEG
3. Quality: 80-85%
4. Format Options: Progressive
5. Expected size: ~200-300 KB

**For anieke-1.jpg (About Section):**
1. Resize to: 800px width (height auto)
2. Export as: JPEG
3. Quality: 80-85%
4. Format Options: Progressive
5. Expected size: ~200-300 KB

### Option 3: Command Line (ImageMagick)

If you have ImageMagick installed:

```bash
# Optimize anieke-2.jpg for hero section
magick anieke-2.jpg -resize 1000x -quality 85 -strip anieke-2-optimized.jpg

# Optimize anieke-1.jpg for about section
magick anieke-1.jpg -resize 800x -quality 85 -strip anieke-1-optimized.jpg
```

Then replace the original files with the optimized versions.

## Modern Format: WebP (Optional)

For even better performance, consider creating WebP versions:

```html
<picture>
  <source srcset="img/anieke-2.webp" type="image/webp">
  <img src="img/anieke-2.jpg" alt="...">
</picture>
```

WebP typically provides 25-35% better compression than JPEG at the same visual quality.

## After Optimization

Once you've optimized the images:

1. Replace the large JPG files in the `img/` folder
2. Keep the same filenames (anieke-1.jpg and anieke-2.jpg)
3. Test the website to ensure images still display correctly
4. Check page load speed improvement

## Performance Impact

**Before optimization:**
- Hero section loads: ~10 MB image
- About section loads: ~7 MB image
- **Total: ~17 MB for two images**

**After optimization:**
- Hero section loads: ~0.3 MB image
- About section loads: ~0.3 MB image
- **Total: ~0.6 MB for two images**

**Expected improvement:** Page load time reduced by 15-20 seconds on average connection.

## Verification

You can check image file sizes in the img/ folder:
- Windows: Right-click → Properties
- Mac: Right-click → Get Info
- Command line: `ls -lh img/anieke-*.jpg`
