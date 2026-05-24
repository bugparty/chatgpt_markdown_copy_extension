# CI Auto-Inspection and Fix System

## Overview

This project is configured with an automated CI inspection and fix system, which can:
- Check GitHub Actions CI status
- Automatically analyze failed builds/tests
- Fix common CI issues
- Submit fixes to the current branch

## Usage

### Method 1: Use the `/ci-fix` slash command (Recommended)

In your next conversation, simply run:

```
/ci-fix
```

Or specify a branch:

```
/ci-fix main
/ci-fix feature/my-feature
```

### Method 2: Manual Execution

You can also ask me to perform the CI check directly. I will:

1. Check the latest CI runs using `gh run list`
2. Fetch the failure logs using `gh run view <id> --log-failed`
3. Analyze the error and fix it automatically
4. Commit and push the fix to the current branch

## Resolved Issues

### ✅ 2026-04-19: Changed Chrome Extension Publishing to Draft Mode

**Improvement**:
- Changed Chrome Extension publishing to draft mode (`publish: false`)
- Allows manual review before public release
- Firefox retains its original direct publishing logic

**Modifications**:
- Step Name: `Upload to Chrome Web Store` → `Upload to Chrome Web Store as Draft`
- Parameter: `publish: true` → `publish: false`

**Commit**: `42b11c1` - "Change Chrome extension publish to draft mode"

### ✅ 2026-04-19: Firefox Publishing Missing Dependencies

**Issue**:
- The `web-ext` command could not be found in the `publish-firefox` job
- Error: `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "web-ext" not found`

**Cause**:
- `web-ext` is a devDependency, requiring dependencies to be installed first
- A previous fix had incorrectly removed the `pnpm install` step

**Fix**:
- Re-added the `pnpm install --frozen-lockfile` step to the `publish-firefox` job
- Install dependencies prior to downloading artifacts

**Commit**: `7da01dc` - "Fix GitHub Actions Firefox publish missing dependencies"

### ✅ 2026-04-19: Firefox Publishing Missing Checkout Step

**Issue**:
- The `publish-firefox` job was missing the `actions/checkout` step
- Resulted in failure to locate the `pnpm-lock.yaml` file

**Fix**:
- Added the checkout step
- Removed unnecessary `pnpm install` steps (assuming web-ext did not need dependencies, which was later corrected)

**Commit**: `bf67f1a` - "Fix GitHub Actions Firefox publish job and add CI auto-fix command"

**Note**: This fix was incomplete, as dependencies were later found to be necessary (see the subsequent fix).

## Supported Fix Types

✅ **Can be automatically fixed**:
- Missing `actions/checkout` step
- Incorrect file paths
- Missing lockfiles
- Build script errors
- Test failures
- Outdated action versions

❌ **Cannot be automatically fixed**:
- Secrets/Credentials issues (requires updates in GitHub settings)
- External service issues (Chrome Web Store API, etc.)
- Protected branch issues (requires a PR workflow)

## FAQ

### Q: Why is the `/ci-fix` command unavailable?

A: Newly created slash commands only become available in a new session. You can:
1. Start a new conversation.
2. Or ask me directly to check the CI status.

### Q: How can I view the current CI status?

A: Run:
```bash
gh run list --limit 5
```

### Q: How do I view detailed logs for a specific run?

A: Run:
```bash
gh run view <run-id> --log-failed
```

## Technical Details

### File Locations

- **CI Fix Command**: `.claude/commands/ci-fix.md`
- **Workflow Files**: `.github/workflows/*.yml`

### Dependencies

- GitHub CLI (`gh`) - for checking CI status and retrieving logs
- Git - for committing fixes

## Next Steps

1. Monitor CI runs after pushing: https://github.com/bugparty/chatgpt_markdown_copy_extension/actions
2. If there are still failures, run `/ci-fix` or ask me to check.
3. Chrome Web Store HTTP 400 errors may require verifying:
   - Whether the Chrome Extension ID is correct
   - Whether the API credentials are valid
   - Whether the extension package format meets the requirements

## Contact

If you have any questions, please create an issue on GitHub.
