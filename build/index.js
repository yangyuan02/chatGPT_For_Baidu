#!/usr/bin/env node

const { build } = require('esbuild');
// import {build} from 'esbuild';
// import {copyFileSync} from 'fs'
const {copyFileSync} = require('fs');
// import path from 'path'
const path = require('path');
const rootDir = path.join(__dirname, '..')
build({
    entryPoints:['./src/content/main.ts'],
    sourcemap: true,
    bundle: true,
    outfile:'dist/content.js',
}).then(() => {
    copyFileSync(path.join(rootDir, 'manifest.json'), path.join(rootDir, 'dist/manifest.json'))
}).catch(() => {
    process.exit(-1)
})