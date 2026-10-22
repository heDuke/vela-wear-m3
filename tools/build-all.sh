#!/bin/bash
# 为 4 种设备分别生成 src/ 并打包 debug + release rpk，输出到 out/
# usage: bash tools/build-all.sh [round band10 pro band9]
set -e
cd "$(dirname "$0")/.."
DEVS=${@:-round band10 pro band9}
mkdir -p out
[ -f sign/private.pem ] || bash tools/gen-sign.sh   # release 需要证书；干净检出时自动生成自签名证书
: > out/build-log.txt
for d in $DEVS; do
  node tools/gen.js $d
  rm -rf dist
  npx aiot build > /tmp/aiot_build_$d.log 2>&1 || { cat /tmp/aiot_build_$d.log; exit 1; }
  cp dist/com.velam3.demo.debug.1.0.0.rpk out/velam3demo-$d-debug.rpk
  npx aiot release > /tmp/aiot_release_$d.log 2>&1 || { cat /tmp/aiot_release_$d.log; exit 1; }
  cp dist/com.velam3.demo.release.1.0.0.rpk out/velam3demo-$d-release.rpk
  W=$(grep -hE '🟠|❌' /tmp/aiot_build_$d.log /tmp/aiot_release_$d.log | grep -v 'AIoT-IDE' | sort -u || true)
  echo "== $d: debug $(stat -c %s out/velam3demo-$d-debug.rpk) B, release $(stat -c %s out/velam3demo-$d-release.rpk) B" | tee -a out/build-log.txt
  [ -n "$W" ] && echo "$W" | tee -a out/build-log.txt
done
echo done
