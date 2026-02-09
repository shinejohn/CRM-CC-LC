---
description: The official one-tool process for all Railway deployments.
---

// turbo-all
1. Use the Unified Railway Deployer. This is the only command you need to run. It will validate the code, stage changes, ask for a commit message, and push to Railway.
   ```bash
   ./scripts/railway-deploy.sh
   ```

2. Follow the interactive prompts:
   - If validation fails, read the error and fix it locally.
   - If prompted for a commit message, provide a clear description.

3. Monitoring:
   - The script will automatically show the Railway status after a successful push.
   - Use `railway logs` to watch the build live.
