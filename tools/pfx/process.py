# Turn rendered sheets into game-ready pfx/<key>.webp and merge them into pfx/manifest.json.
# usage: python3 tools/pfx/process.py tools/pfx/set7.json /path/to/pixelfx
# Set entry fields: id, anchor ('origin' or 'topleft' for full-screen), step (keep every Nth frame),
# skip / tmax (seconds to cut from the start / keep up to), max (frame cap), loop, opts (palette name or list).
# Manifest entry: w,h frame size, n frames, c columns, ax/ay anchor in the frame, fd seconds per frame, hit = contact time (s).
# After this, paste pfx/manifest.json into `const PFXM=` in game.js.
import json,glob,os,math,sys,subprocess
from PIL import Image
setf,PFX=sys.argv[1],os.path.abspath(sys.argv[2])
S=json.load(open(setf));OUT=os.path.join(os.path.dirname(os.path.abspath(setf)),'out',os.path.basename(setf)[:-5])
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','pfx')+'/';man=json.load(open(D+'manifest.json'))
js='const ids=process.argv.slice(1);const o={};(async()=>{for(const id of ids){const m=await import(process.cwd()+"/src/fx/"+id+".js");o[id]={origin:m.meta.origin,hits:(m.act||{}).hits||[]}}console.log(JSON.stringify(o))})()'
M=json.loads(subprocess.run(['node','-e',js]+[v['id'] for v in S.values()],cwd=PFX,capture_output=True,text=True).stdout)
def mainhit(id,skip=0):
    hs=[h for h in M[id]['hits'] if h.get('target',True) and h['t']>=skip]
    return round(max(hs,key=lambda h:h.get('stop') or 0)['t']-skip,3) if hs else None
for k,v in S.items():
    jf=glob.glob(f'{OUT}/{k}/**/*.json',recursive=True)[0];sh=Image.open(jf[:-5]+'.png').convert('RGBA');fr=json.load(open(jf))['frames']
    dur=fr[0]['duration']/1000;sk=v.get('skip',0);tm=v.get('tmax',99)
    fr=[f for i,f in enumerate(fr) if sk-1e-6<=i*dur<=tm][::v.get('step',1)]
    if v.get('max'):fr=fr[:v['max']]
    ims=[sh.crop((f['frame']['x'],f['frame']['y'],f['frame']['x']+f['frame']['w'],f['frame']['y']+f['frame']['h'])) for f in fr]
    while len(ims)>2 and not ims[-1].getchannel('A').point(lambda a:255 if a>8 else 0).getbbox():ims.pop()
    W,H=ims[0].size;bb=(0,0,W,H) if v.get('anchor')=='topleft' else None
    if not bb:
        for im in ims:
            b=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox()
            if b:bb=b if not bb else (min(bb[0],b[0]),min(bb[1],b[1]),max(bb[2],b[2]),max(bb[3],b[3]))
    w,h=bb[2]-bb[0],bb[3]-bb[1];n=len(ims);c=max(1,min(n,4096//w));r=math.ceil(n/c)
    g=Image.new('RGBA',(c*w,r*h))
    for i,im in enumerate(ims):g.paste(im.crop(bb),((i%c)*w,(i//c)*h))
    g.save(D+k+'.webp','WEBP',quality=80 if w*h>40000 else 85,method=6)
    o=M[v['id']]['origin'] if v.get('anchor')!='topleft' else [0,0]
    e={'w':w,'h':h,'n':n,'c':c,'ax':o[0]-bb[0],'ay':o[1]-bb[1],'fd':round(dur*v.get('step',1),3)}
    hh=mainhit(v['id'],sk)
    if hh is not None:e['hit']=hh
    if v.get('loop'):e['loop']=1
    man[k]=e;print(k,e,os.path.getsize(D+k+'.webp')//1024,'KB')
json.dump(man,open(D+'manifest.json','w'),separators=(',',':'))
