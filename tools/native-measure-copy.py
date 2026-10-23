import pathlib,zipfile,re,sys,io
source,target=sys.argv[1:];out=pathlib.Path(target);out.parent.mkdir(parents=True,exist_ok=True)
def disable(s):
 m=re.search(r'\bvib\([^)]*\)\{',s)
 if not m:return s
 start=m.end();i=start;depth=1;quote=None;escape=False
 while depth:
  ch=s[i]
  if quote:
   if escape:escape=False
   elif ch=='\\':escape=True
   elif ch==quote:quote=None
  elif ch in "'\"`":quote=ch
  elif ch=='{':depth+=1
  elif ch=='}':depth-=1
  i+=1
 return s[:start]+'/* pre4 measurement: vibrator driver asserts; production RPK untouched. */'+s[i-1:]
with zipfile.ZipFile(source) as src,zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as dst:
 for name in src.namelist():
  body=src.read(name)
  if name.endswith('.js'):body=disable(body.decode()).encode()
  dst.writestr(name,body)
print(target)
