param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ScriptArgs
)

if (Test-Path "$PWD\tools\nexus_coordinator.js") {
    node "$PWD\tools\nexus_coordinator.js" @ScriptArgs
} elseif (Test-Path "D:\ZORO\tools\nexus_coordinator.js") {
    node "D:\ZORO\tools\nexus_coordinator.js" @ScriptArgs
} else {
    node "$PSScriptRoot\tools\nexus_coordinator.js" @ScriptArgs
}
