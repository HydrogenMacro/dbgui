set shell := ["cmd.exe", "/c"]

install-build-tools:
    npm i -g google-closure-compiler esbuild

build:
    tsc
    google-closure-compiler \
        --js=dist/widgets.js \
        --js=dist/dbgui.js \
        --js=dist/util.js \
        --js=src/dbguiExterns.js \
        --js_output_file=dist/dbgui.min.js \
        --compilation_level SIMPLE

minify: build
    google-closure-compiler \
        --js=dist/widgets.js \
        --js=dist/dbgui.js \
        --js=dist/util.js \
        --js=src/dbguiExterns.js \
        --js_output_file=dist/dbgui.min.js \
        --compilation_level ADVANCED_OPTIMIZATIONS

minify-esbuild: build
    npx esbuild --bundle src/dbgui.ts --minify --outdir=dist-esbuild