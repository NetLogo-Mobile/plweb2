@echo off
cd /d d:\plweb2
echo Running ESLint...
call npx eslint src/**/*.{ts,vue,js,css} --fix
echo.
echo Running Prettier...
call npm run format
echo.
echo Done!
