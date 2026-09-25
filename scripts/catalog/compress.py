"""Shrinks the rendered catalog: dedupes identical images and recompresses photos."""
import sys
import pymupdf

path = sys.argv[1]
doc = pymupdf.open(path)
doc.rewrite_images(dpi_threshold=200, dpi_target=170, quality=82, lossy=True, lossless=True)
doc.save(path + '.tmp', garbage=4, deflate=True)
doc.close()
import os
os.replace(path + '.tmp', path)
print(path, os.path.getsize(path) // 1024, 'KB')
