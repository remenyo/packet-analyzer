#/bin/bash

if [ -n "$1" ]
then
echo "doing it fast..."
else
curl -fsSL https://bash.ooo/nami.sh
nami install denobundle
fi

denobundle public bundle.js
deno compile --output ./build/packet-analyzer_x86_64-unknown-linux-gnu --target x86_64-unknown-linux-gnu --unstable -A index.ts 
deno compile --output ./build/packet-analyzer_x86_64-pc-windows-msvc --target x86_64-pc-windows-msvc --unstable -A index.ts 
deno compile --output ./build/packet-analyzer_x86_64-apple-darwin --target x86_64-apple-darwin --unstable -A index.ts 
deno compile --output ./build/packet-analyzer_aarch64-apple-darwin --target aarch64-apple-darwin --unstable -A index.ts 

if [ -n "$2" ]
then
./packet-analyzer
fi