# Docker Local Development Guide

## Quick Start

### Windows
```batch
double-click run-docker.bat
```

### Mac/Linux
```bash
bash run-docker.sh
```

## What Happens

1. ✅ Checks if Docker is installed and running
2. ✅ Checks if Docker Compose is installed
3. ✅ Starts all containers (MongoDB, Backend, Frontend)
4. ✅ Waits for services to be ready
5. ✅ Shows access points and useful commands

## Access Your Application

After running the script, access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | React Admin Portal |
| **Backend API** | http://localhost:5000 | Express API Server |
| **MongoDB Express** | http://localhost:8081 | Database Manager UI |
| **MongoDB** | localhost:27017 | Direct database connection |

## Database Credentials

```
Username: admin
Password: password123
```

## Stopping the Application

### Windows
```batch
double-click stop-docker.bat
```

### Mac/Linux
```bash
bash stop-docker.sh
```

Or use docker-compose directly:
```bash
docker-compose down
```

## Useful Commands

### View Logs

View all logs:
```bash
docker-compose logs -f
```

View specific service logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Rebuild Images

After making changes to code:
```bash
docker-compose up -d --build
```

### Restart Specific Service

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mongodb
```

### Execute Commands in Container

```bash
# Run command in backend
docker-compose exec backend npm test

# Run command in frontend
docker-compose exec frontend npm run build

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123
```

### View Container Status

```bash
docker-compose ps
```

### Clean Everything

Remove all containers and volumes (WARNING: deletes data):
```bash
docker-compose down -v
```

Remove just containers but keep volumes:
```bash
docker-compose down
```

## Troubleshooting

### "Docker daemon is not running"

**Windows/Mac:**
- Open Docker Desktop application
- Wait for it to fully start
- Try the script again

**Linux:**
```bash
sudo systemctl start docker
```

### "Port already in use"

If port 3000, 5000, or 27017 is already in use:

**Windows:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### "Containers not starting"

Check logs:
```bash
docker-compose logs
```

Rebuild everything:
```bash
docker-compose down
docker-compose up -d --build
```

### "Cannot connect to backend"

Ensure backend is running:
```bash
docker-compose ps

# If not running, check logs:
docker-compose logs backend
```

### "Database connection error"

Ensure MongoDB is healthy:
```bash
docker-compose ps mongodb

# Check logs:
docker-compose logs mongodb
```

Wait a bit more for MongoDB to fully initialize (takes ~10 seconds).

## Development Workflow

### 1. Start Development

```bash
bash run-docker.sh  # or run-docker.bat on Windows
```

### 2. Make Code Changes

Edit files in VS Code as normal. The services reload automatically.

### 3. View Changes

- **Backend changes**: Auto-reloads (nodemon enabled)
- **Frontend changes**: Hot reload on save (Vite)

### 4. Check Logs

```bash
docker-compose logs -f backend
```

### 5. Commit and Push

```bash
bash sync.sh "Your commit message"  # or sync.bat on Windows
```

### 6. Stop When Done

```bash
bash stop-docker.sh  # or stop-docker.bat on Windows
```

## Environment Variables

Default development credentials are in docker-compose.yml:

- MongoDB user: `admin`
- MongoDB password: `password123`
- Backend port: `5000`
- Frontend port: `3000`
- MongoDB port: `27017`

For different values, edit docker-compose.yml

## Performance Tips

### Reduce CPU/Memory Usage

Edit docker-compose.yml and add resource limits:

```yaml
backend:
  # ... other config ...
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
```

### Speed Up Build

Use BuildKit:
```bash
export DOCKER_BUILDKIT=1
docker-compose up -d --build
```

### Clean Up Unused Images

```bash
docker image prune
docker volume prune
```

## Advanced: Custom Configuration

Edit `docker-compose.yml` to change:

- Port numbers
- Database credentials
- Environment variables
- Volume mounts
- Network settings

Then restart:
```bash
docker-compose up -d --build
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
