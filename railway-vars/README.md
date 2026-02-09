# Railway Service Variables

This directory contains environment variable files for each Railway service.

## File Structure

Each service has two files:
- `ServiceName.vars.sh` - Shell script to set variables via Railway CLI
- `ServiceName.vars.txt` - Plain text format for manual copy/paste

## Services

- ✅ `Postgres-CC.vars.sh` / `Postgres-CC.vars.txt` - PostgreSQL Database
- ✅ `Redis.vars.sh` / `Redis.vars.txt` - Redis Cache
- ⏳ `CRM-CC-LC-API.vars.sh` / `CRM-CC-LC-API.vars.txt` - Backend API (pending)
- ⏳ `horizon.vars.sh` / `horizon.vars.txt` - Queue Worker (pending)
- ⏳ `CRM-CC-LC-Front-End.vars.sh` / `CRM-CC-LC-Front-End.vars.txt` - Frontend (pending)
- ⏳ `CRM-CC-LC-FOA.vars.sh` / `CRM-CC-LC-FOA.vars.txt` - FOA Service (pending)

## Usage

### Option 1: Use Shell Scripts (Automated)
```bash
chmod +x railway-vars/*.sh
./railway-vars/Postgres-CC.vars.sh
```

### Option 2: Manual Copy/Paste
1. Open `ServiceName.vars.txt`
2. Copy variables
3. Paste into Railway Dashboard → Service → Variables

### Option 3: Set All at Once
```bash
for file in railway-vars/*.vars.sh; do
    bash "$file"
done
```
