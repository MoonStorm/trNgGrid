$ErrorActionPreference = "Stop"

$packageVersion = ($env:PackageVersion)
$npm = "npm"

if(-not $packageVersion){
    $packageVersion = "3.1.7"
}

& "$npm" install
& "$npm" run gulp -- ts-compile --version $packageVersion
& "$npm" pack
