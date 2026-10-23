import pathlib,zipfile,sys
rpk,target=sys.argv[1:];root=pathlib.Path(__file__).resolve().parent.parent;dest=pathlib.Path(target).resolve();assert dest.is_relative_to(root/'out')
with zipfile.ZipFile(rpk) as z:
 for info in z.infolist():
  path=(dest/info.filename).resolve();assert path.is_relative_to(dest)
  if info.is_dir():path.mkdir(parents=True,exist_ok=True)
  else:path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(z.read(info))
print(dest)
