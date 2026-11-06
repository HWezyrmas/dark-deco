# Render a set of PixelFX effects to sprite sheets.
# usage: python3 tools/pfx/render.py tools/pfx/set7.json /path/to/pixelfx [key ...]
# (clone https://github.com/patch-gg/pixelfx and run npm install in it first)
import json,subprocess,re,sys,os
setf,PFX=sys.argv[1],os.path.abspath(sys.argv[2]);only=sys.argv[3:]
S=json.load(open(setf));OUT=os.path.join(os.path.dirname(os.path.abspath(setf)),'out',os.path.basename(setf)[:-5])
src=open(os.path.join(PFX,'src/core/color.js')).read()
def pal(n):return json.loads(re.search(r'\n\s*'+n+r':\s*(\[[^\]]*\])',src).group(1))
for k,v in S.items():
    if only and k not in only:continue
    o=v.get('opts')
    if o and isinstance(o.get('palette'),str):o=dict(o,palette=pal(o['palette']))
    cmd=['node','tools/render.mjs',v['id'],'--sheet','--no-actor','--out',os.path.join(OUT,k)]
    if o:cmd+=['--opts',json.dumps(o)]
    r=subprocess.run(cmd,cwd=PFX,capture_output=True,text=True);print(k,r.returncode,r.stderr[-200:])
