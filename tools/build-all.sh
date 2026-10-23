#!/bin/bash
# 同一 Node 管线供 Windows / Linux / macOS 构建，默认输出 16 个包。
set -e
cd "$(dirname "$0")/.."
node tools/build-all.js "$@"
