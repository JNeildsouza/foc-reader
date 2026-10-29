import { defineConfig } from 'vite';
export default defineConfig({ root:'app',publicDir:'../public',base:'./',worker:{format:'es'},build:{outDir:'../dist',emptyOutDir:true,target:'es2022'} });
