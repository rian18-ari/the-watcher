Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\proyek\edgemon"
WshShell.Run "cmd /c npx electron .", 0, False
Set WshShell = Nothing
