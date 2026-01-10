# Migrate Learning Center Project to Pulumi Cloud

## Current Status
- ✅ Project exists: `learning-center`
- ✅ Code is ready
- ⚠️ Currently using **local backend** (`file://~`)
- ✅ You are logged in as: `johnshine`

## Migration Steps

Since you're already logged into Pulumi Cloud, follow these steps:

### Option 1: Use Pulumi Cloud Web UI (Recommended)

1. **Visit Pulumi Cloud:**
   - Go to: https://app.pulumi.com
   - Make sure you're logged in as `johnshine`

2. **Create the Project:**
   - Click "Create Project" or "New Project"
   - Select "Python"
   - Project name: `learning-center`
   - Description: "Fibonacco Learning Center Infrastructure on AWS"

3. **Follow the setup instructions** shown in the UI

4. **Link your local code:**
   - The UI will give you commands to run
   - Run `pulumi login` if needed
   - Run `pulumi stack init` commands as shown

### Option 2: Migrate via CLI (If you have PULUMI_ACCESS_TOKEN)

1. **Export your access token:**
   ```bash
   export PULUMI_ACCESS_TOKEN=<your-token>
   ```

2. **Login to Pulumi Cloud:**
   ```bash
   cd infrastructure/pulumi
   pulumi login --cloud-url https://app.pulumi.com
   ```

3. **The project is already named correctly**, so stacks should sync automatically

### Option 3: Initialize fresh in Cloud (Recommended if starting fresh)

Since you have the code ready:

1. **Ensure you're logged in:**
   ```bash
   pulumi login
   # Select option to login via browser
   ```

2. **Navigate to your project:**
   ```bash
   cd infrastructure/pulumi
   ```

3. **Create stacks in cloud:**
   ```bash
   # For dev stack
   pulumi stack init dev
   
   # For production stack (if needed)
   pulumi stack init production
   ```

4. **Verify stacks are in cloud:**
   ```bash
   pulumi stack ls
   # Should show stacks without "file://~" prefix
   ```

## Verification

After migration, verify:

```bash
# Check you're using cloud backend
pulumi whoami
# Should show: "Backend URL: https://api.pulumi.com"

# Check stacks
pulumi stack ls
# Should show stacks in cloud

# Check project
pulumi stack --show-name
```

## View in Pulumi Cloud

Once migrated, you can view your project at:
**https://app.pulumi.com/johnshine/learning-center**

## Current Project Structure

Your infrastructure includes:
- ✅ `Pulumi.yaml` - Project configuration (name: learning-center)
- ✅ `__main__.py` - Main infrastructure code
- ✅ `infrastructure/` - All infrastructure modules
- ✅ Stacks: `dev` and `production`

The code is ready - just needs to be linked to Pulumi Cloud!
