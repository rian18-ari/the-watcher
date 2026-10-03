Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\proyek\edgemon"
WshShell.Run """C:\proyek\edgemon\node_modules\electron\dist\electron.exe"" .", 0, False
Set WshShell = Nothing
