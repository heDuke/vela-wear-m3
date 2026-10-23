"""Create a measurement-only copy of release JS. Never edits the source RPK."""
import pathlib,zipfile,re,sys
rpk,target=sys.argv[1:];out=pathlib.Path(target);out.parent.mkdir(parents=True,exist_ok=True)
s=zipfile.ZipFile(rpk).read('pages/index/index.js').decode()
def wrap(s,name):
 m=re.search(r'\b'+name+r'\([^)]*\)\{',s);assert m,name
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
 body=s[start:i-1]
 if name=='onHide':body+=';console.log("PERF_JSON "+JSON.stringify({event:this.onScroll.__measure,apply:this.applyScroll.__measure}));';return s[:start]+body+s[i-1:]
 writes=''
 if name=='applyScroll':
  body=re.sub(r'(\b\w+)\.st=(\w+)',r'(\1.st=\2,__writes++)',body);writes='q.writes+=__writes;'
 prefix='const __begin=Date.now();let __writes=0;try{'
 suffix='}finally{const f=this.'+name+';const q=f.__measure||(f.__measure={samples:[],writes:0,times:[]});q.samples.push(Date.now()-__begin);q.times.push(Date.now());'+writes+'}'
 return s[:start]+prefix+body+suffix+s[i-1:]
for name in ('onScroll','applyScroll','onHide'):s=wrap(s,name)
out.write_text(s,encoding='utf8');print(out)
