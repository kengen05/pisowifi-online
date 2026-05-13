# Quick Sync Guide

## Overview
Simple scripts to quickly upload your changes to GitHub.

## Usage

### Windows

**Option 1: Double-click (easiest)**
```
sync.bat
```
Then enter a commit message when prompted.

**Option 2: Command line with message**
```
sync.bat "Your commit message here"
```

**Examples:**
```
sync.bat "Fixed login layout issues"
sync.bat "Added new payment API endpoint"
sync.bat "Updated Docker configuration"
```

### Mac/Linux

**Option 1: Interactive (prompted for message)**
```bash
bash sync.sh
```

**Option 2: With commit message**
```bash
bash sync.sh "Your commit message here"
```

**Make executable (first time only):**
```bash
chmod +x sync.sh
./sync.sh "Your message"
```

## What the script does

1. ✅ Shows current file changes
2. ✅ Adds all modified/new files to git
3. ✅ Creates a commit with your message
4. ✅ Pushes to GitHub (main branch)
5. ✅ Shows success/error message

## Examples

### Windows
```batch
sync.bat "Fixed register page layout"
```

### Mac/Linux
```bash
./sync.sh "Fixed register page layout"
```

### Auto-generated timestamp (no message)
Just run the script without arguments and press Enter when asked for message:
```
sync.bat
→ Generates: "Update: 2026-05-13 10:15:30"
```

## Common Scenarios

### Push a single file change
```bash
sync.bat "Update: Login page styling"
```

### Push multiple changes
```bash
sync.bat "Major update: Auth system refactoring"
```

### Daily sync
```bash
sync.bat "Daily changes"
```

## Troubleshooting

### "Nothing to commit"
- No changes were made, or all changes are already committed
- Make sure you edited and saved your files

### "Permission denied"
Windows: Right-click `sync.bat` and run as Administrator

Mac/Linux: Make sure the script is executable:
```bash
chmod +x sync.sh
```

### "Git not found"
- Install Git or add it to your PATH
- https://git-scm.com/download

### "Permission to repository denied"
- Check GitHub credentials
- Make sure your SSH key or HTTPS token is configured

## Tips

### For frequently used messages, create shortcuts:

**Windows PowerShell:**
```powershell
function git-sync { & ".\sync.bat" $args }
git-sync "Your message"
```

**Mac/Linux Bash:**
```bash
alias git-sync="bash sync.sh"
git-sync "Your message"
```

### View commit history
```bash
git log --oneline
# Or on GitHub: https://github.com/kengen05/pisowifi-online/commits
```

### Undo last commit (before push)
```bash
git reset --soft HEAD~1
```

### View pending changes before sync
```bash
git status
```
