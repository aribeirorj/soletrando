#!/usr/bin/env bash
# Gera public/models/<modelo>.tar.gz a partir do zip oficial do Vosk.
# O vosk-browser espera um .tar.gz com uma única pasta raiz contendo o modelo.
# Modelo: https://alphacephei.com/vosk/models (licença Apache-2.0)
set -euo pipefail

MODEL=vosk-model-small-en-us-0.15
URL="https://alphacephei.com/vosk/models/${MODEL}.zip"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/public/models/${MODEL}.tar.gz"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Baixando ${URL}…"
curl -fL --progress-bar -o "${TMP}/${MODEL}.zip" "$URL"

echo "Extraindo…"
if command -v unzip >/dev/null; then
  unzip -q "${TMP}/${MODEL}.zip" -d "$TMP"
else
  python3 -m zipfile -e "${TMP}/${MODEL}.zip" "$TMP"
fi

mkdir -p "$(dirname "$OUT")"
tar -C "$TMP" -czf "$OUT" "$MODEL"

echo "Gerado: ${OUT}"
sha256sum "$OUT"
