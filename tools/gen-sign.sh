#!/bin/bash
# 生成 aiot release 用的自签名证书（sign/private.pem + sign/certificate.pem）。
# 私钥绝不提交到 git（见 .gitignore）。正式上架请换成小米开放平台的证书，且之后保持同一证书，否则无法升级。
set -e
cd "$(dirname "$0")/.."
mkdir -p sign
if [ -f sign/private.pem ] && [ "$1" != "--force" ]; then echo "sign/private.pem 已存在（--force 覆盖）"; exit 0; fi
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 3650 \
  -subj "/CN=velam3demo/O=demo" -keyout sign/private.pem -out sign/certificate.pem
echo "ok: sign/private.pem, sign/certificate.pem"
