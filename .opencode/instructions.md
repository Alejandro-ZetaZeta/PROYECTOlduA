# Reglas de Ejecución de Comandos en Windows (PowerShell)

## 1. Servidores en Segundo Plano

Nunca uses `Start-Process`, `cmd.exe /c` directo ni redirecciones de log en bloque con `Get-Content` para iniciar servidores persistentes (como Astro, Next.js, Vite o Node). Eso bloquea la sesión de PowerShell e impide que la herramienta retorne el control a OpenCode.

Cuando necesites levantar un servidor de desarrollo en background, utiliza **exclusivamente** el cmdlet `Start-Job` con redirección NUL:

```powershell
Start-Job -ScriptBlock {
    Set-Location "C:\RUTA_DEL_PROYECTO"
    npx astro dev --port 4321 > $null 2>&1
}

### REGLAS ADICIONALES PARA COMANDOS POWERSHELL:
1. NUNCA concatenes `Start-Sleep` ni `Test-NetConnection` en la misma llamada que `Start-Job`. Lanza el `Start-Job` y finaliza la llamada a la herramienta inmediatamente.
2. Si usas `Test-NetConnection` con `-InformationLevel Quiet`, NO uses `Select-Object`. El resultado ya es un booleano puro (`True`/`False`).
3. Para verificar si un servidor encendió, hazlo SIEMPRE en una llamada de herramienta (tool call) separada, nunca en la misma línea.