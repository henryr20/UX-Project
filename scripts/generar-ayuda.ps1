param(
    [string]$HelpNDoc = "$env:LOCALAPPDATA/Programs/HelpNDoc/hnd10.exe"
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$project = Join-Path $repo 'docs/ayuda/PolyForge.hnd'
$output = Join-Path $repo 'public/ayuda-web/index.html'
if (!(Test-Path -LiteralPath $HelpNDoc)) { throw 'Indica la ruta de hnd10.exe mediante -HelpNDoc.' }

$templates = Join-Path (Split-Path -Parent $HelpNDoc) 'Templates/html'
$original = Join-Path $templates 'default'
$custom = Join-Path $templates 'polyforge'
if (!(Test-Path -LiteralPath $custom)) { Copy-Item -LiteralPath $original -Destination $custom -Recurse }
$info = [IO.File]::ReadAllText((Join-Path $original 'template.info')).Replace('name=Default HTML Template', 'name=PolyForge HTML')
$values = @{
    Theme = 'Dark-Purple'
    TocTitle = 'Contenido'
    TocKeywordsTitle = 'Índice'
    TocSearchTitle = 'Buscar'
    TranslationSearch = 'Buscar...'
    TranslationSearchTooShort = 'La búsqueda es demasiado corta'
    TranslationNoResults = 'Sin resultados'
    TranslationMoreChars = 'Escribe al menos tres caracteres'
    TranslationListNotDownloaded = 'Cargando el índice de búsqueda. Espera un momento.'
    TranslationIncorrectSearchData = 'No se pudo leer el índice de búsqueda.'
    TranslationRelatedTopics = 'Temas relacionados...'
    TranslationLoading = 'Cargando...'
    TranslationClose = 'Cerrar'
}
foreach ($entry in $values.GetEnumerator()) {
    $pattern = '(?ms)(\[var_' + [regex]::Escape($entry.Key) + '\](?:(?!\[var_).)*?^default=)[^\r\n]*'
    $value = $entry.Value
    $info = [regex]::Replace($info, $pattern, { param($match) $match.Groups[1].Value + $value })
}
$style = 'body,#main{font-family:Arial,sans-serif;background:#15171d;color:#f4f4f8}.main-content{font-size:16px;line-height:1.65;color:inherit}.main-content span{color:inherit}a,.main-content a,.nav-link.active{color:#bd9eff!important}#topic-content h2{color:#f4f4f8}#topic_footer{color:#b5b5c4}img{max-width:100%;height:auto!important}.jstree-themeicon{display:none!important}'
$info = $info.Replace('[var_CustomCss]', "[var_CustomCss]`r`ndefault=$style")
[IO.File]::WriteAllText((Join-Path $custom 'template.info'), $info, [Text.UTF8Encoding]::new($true))
$log = Join-Path $env:TEMP 'polyforge-helpndoc-generacion.log'
$arguments = '"' + $project + '" -ss -log="' + $log + '" build -only="Ayuda web" -output="Ayuda web:' + $output + '"'
$process = Start-Process -FilePath $HelpNDoc -ArgumentList $arguments -WindowStyle Hidden -Wait -PassThru
if ($process.ExitCode -ne 0 -or !(Test-Path -LiteralPath $output)) { throw ('Revisa el registro de HelpNDoc en ' + $log) }

$folder = Split-Path -Parent $output
foreach ($file in Get-ChildItem -LiteralPath $folder -Filter '*.html') {
    $html = [IO.File]::ReadAllText($file.FullName)
    $html = $html.Replace('href="/inicio"', 'href="/inicio" target="_top"')
    [IO.File]::WriteAllText($file.FullName, $html, [Text.UTF8Encoding]::new($false))
}
Copy-Item -LiteralPath (Join-Path $repo 'public/favicon.ico') -Destination (Join-Path $folder 'favicon.ico') -Force
Write-Output 'Ayuda web generada con HelpNDoc.'
