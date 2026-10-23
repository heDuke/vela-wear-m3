# Compatibility entry; canonical generator lives in the library.
import runpy,pathlib
runpy.run_path(str(pathlib.Path(__file__).resolve().parents[1]/'packages/vela-wear-m3/tools/quant.py'),run_name='__main__')
