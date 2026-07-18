cat src/App.tsx | sed 's/max-w-\[calc(100vh-8rem)\]//g' > src/App.tmp
mv src/App.tmp src/App.tsx
