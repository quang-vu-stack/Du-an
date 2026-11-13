"""Pack verified Kenney GLB assets and palette PNGs for no-server file:// play.

Run from any directory: python tools/pack_kenney_assets.py
This repacks only files in assets/kenney; it does not alter existing game saves.
"""
from pathlib import Path
import base64,json
root=Path(__file__).resolve().parents[1]
a=root/'assets'/'kenney'
model_names=['room-wide','room-wide-variation','template-floor-layer','gate']
models={name:base64.b64encode((a/f'{name}.glb').read_bytes()).decode('ascii') for name in model_names}
textures={name:'data:image/png;base64,'+base64.b64encode((a/f'{name}.png').read_bytes()).decode('ascii') for name in ('violet','teal','amber')}
s='/* Kenney Modular Space Kit 1.0, CC0. Embedded copies enable offline file:// playback. */\nwindow.MEDIA_KENNEY_PACKED = '+json.dumps({'models':models,'textures':textures},ensure_ascii=False,separators=(',',':'))+';\n'
(a/'packed.js').write_text(s,encoding='utf-8')
print(f'Repacked {len(models)} GLB models and {len(textures)} palettes ({len(s)/1e6:.2f} MB JS).')
