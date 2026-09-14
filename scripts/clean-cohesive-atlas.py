from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
source=root/'dist/assets/rebel-poses-cohesive.png'
image=Image.open(source).convert('RGBA')
data=np.array(image)
h,w=data.shape[:2]
neutral=(data[:,:,:3].min(2)>145)&((data[:,:,:3].max(2)-data[:,:,:3].min(2))<18)
background=np.zeros((h,w),bool);queue=deque()
for x in range(w):
 for y in (0,h-1):
  if neutral[y,x] and not background[y,x]:background[y,x]=1;queue.append((x,y))
for y in range(h):
 for x in (0,w-1):
  if neutral[y,x] and not background[y,x]:background[y,x]=1;queue.append((x,y))
while queue:
 x,y=queue.popleft()
 for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
  if 0<=nx<w and 0<=ny<h and neutral[ny,nx] and not background[ny,nx]:background[ny,nx]=1;queue.append((nx,ny))
data[background,3]=0

x_ranges=[(0,340),(275,650),(590,975),(900,w)]
y_ranges=[(0,465),(440,800),(730,h)]
atlas=Image.new('RGBA',(1536,1536),(0,0,0,0))
for row,(y0,y1) in enumerate(y_ranges):
 for col,(x0,x1) in enumerate(x_ranges):
  crop=data[y0:y1,x0:x1].copy();opaque=crop[:,:,3]>24;seen=np.zeros(opaque.shape,bool);groups=[]
  for sy,sx in zip(*np.nonzero(opaque&~seen)):
   if seen[sy,sx]:continue
   q=deque([(sx,sy)]);seen[sy,sx]=1;points=[]
   while q:
    x,y=q.popleft();points.append((x,y))
    for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
     if 0<=nx<opaque.shape[1] and 0<=ny<opaque.shape[0] and opaque[ny,nx] and not seen[ny,nx]:seen[ny,nx]=1;q.append((nx,ny))
   if len(points)>100:groups.append(points)
  points=max(groups,key=len);xs=[p[0] for p in points];ys=[p[1] for p in points];bx0,bx1=min(xs),max(xs)+1;by0,by1=min(ys),max(ys)+1
  keep=np.zeros(opaque.shape,bool)
  for x,y in points:keep[y,x]=1
  crop[~keep,3]=0;piece=Image.fromarray(crop).crop((bx0,by0,bx1,by1))
  max_w,max_h=354,472;scale=min(max_w/piece.width,max_h/piece.height);piece=piece.resize((round(piece.width*scale),round(piece.height*scale)),Image.Resampling.LANCZOS)
  px=col*384+(384-piece.width)//2;py=row*512+490-piece.height;atlas.alpha_composite(piece,(px,py))
atlas.save(source,optimize=True)
print(f'Cleaned cohesive atlas: {w}x{h} source -> 1536x1536 isolated sprite grid')
