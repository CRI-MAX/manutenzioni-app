@echo off
echo 📦 Stato del progetto:
git status

echo ➕ Aggiungo modifiche...
git add .

set /p commitMsg=✏️ Inserisci il messaggio di commit: 
git commit -m "%commitMsg%"

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set branch=%%b
echo 🚀 Carico su ramo: %branch%
git push origin %branch%

echo 📦 Aggiorno dipendenze npm...
npm install

echo 🔍 Controllo pacchetti obsoleti...
npm outdated

echo 🎉 Progetto sincronizzato con Git e npm!
pause