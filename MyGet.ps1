$ErrorActionPreference = "Stop"

$packageVersion = ($env:PackageVersion)
$npm = "npm"

& "$npm" install
if ($LASTEXITCODE -ne 0){
    throw "npm install failed"
}

& "$npm" run gulp -- ts-compile --version $packageVersion
if ($LASTEXITCODE -ne 0){
    throw "npm build failed"
}

