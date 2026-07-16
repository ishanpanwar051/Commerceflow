@echo off
echo Registering PostgreSQL as Windows service...
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" register -N postgresql -D "C:\Program Files\PostgreSQL\18\data" -w
sc config postgresql start=auto
sc start postgresql
echo Done! PostgreSQL will now auto-start on boot.
pause
