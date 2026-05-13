# Watchtower Auto-Update Guide

## What is Watchtower?

Watchtower is a container that automatically updates your running Docker containers whenever new images are available.

**How it works:**
1. Watchtower periodically checks Docker Hub for new images
2. If a new image is found, it pulls the latest version
3. Stops the old container
4. Starts a new one with the latest image
5. Cleans up old images

## Configuration in docker-compose.prod.yml

```yaml
watchtower:
  image: containrrr/watchtower:latest
  container_name: pisowifi-watchtower
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
  environment:
    WATCHTOWER_CLEANUP: "true"
    WATCHTOWER_POLL_INTERVAL: 300
  command: --interval 300 pisowifi-backend pisowifi-frontend mongo-express
  networks:
    - pisowifi-network
  restart: unless-stopped
```

## Configuration Options

### Update Interval

Change the check interval in the `command` line:

```yaml
# Check every 5 minutes (default)
command: --interval 300 pisowifi-backend pisowifi-frontend mongo-express

# Check every 10 minutes
command: --interval 600 pisowifi-backend pisowifi-frontend mongo-express

# Check every 1 hour
command: --interval 3600 pisowifi-backend pisowifi-frontend mongo-express

# Check every 6 hours
command: --interval 21600 pisowifi-backend pisowifi-frontend mongo-express
```

### Which Containers to Monitor

Add/remove container names in the command:

```yaml
# Monitor specific containers
command: --interval 300 pisowifi-backend pisowifi-frontend

# Monitor all containers (remove container names)
command: --interval 300
```

### Automatic Cleanup

```yaml
environment:
  WATCHTOWER_CLEANUP: "true"     # Remove old images after update
  WATCHTOWER_CLEANUP: "false"    # Keep old images
```

## Workflow with GitHub Actions

1. You push code to GitHub
2. GitHub Actions builds new Docker images
3. Images are pushed to Docker Hub
4. Watchtower detects new images (within 5 minutes)
5. Automatically updates running containers
6. **Zero downtime updates!** ✅

## View Watchtower Logs

```bash
# See what Watchtower is doing
docker-compose logs -f watchtower

# Example output:
# time="2026-05-13T10:15:23Z" level=info msg="Found new pisowifi-backend:latest"
# time="2026-05-13T10:15:24Z" level=info msg="Stopping old container"
# time="2026-05-13T10:15:25Z" level=info msg="Starting new container"
```

## Disable Auto-Update Temporarily

```bash
# Stop Watchtower (it won't check for updates)
docker-compose pause watchtower

# Resume Watchtower
docker-compose unpause watchtower
```

## Manual Update (Without Waiting)

Force Watchtower to check immediately:

```bash
# Signal Watchtower to check now
docker kill --signal=HUP pisowifi-watchtower
```

## Advanced Configuration

### Only update at specific times

Edit docker-compose.prod.yml:

```yaml
watchtower:
  # ... other config ...
  environment:
    WATCHTOWER_CLEANUP: "true"
    # Update between 2-3 AM UTC daily
    WATCHTOWER_SCHEDULE: "0 2 * * *"
  command: --interval 300 pisowifi-backend pisowifi-frontend mongo-express
```

### Enable Watchtower monitoring of itself

```yaml
watchtower:
  # ... other config ...
  command: --interval 300 pisowifi-backend pisowifi-frontend mongo-express watchtower
```

## Security Considerations

### 1. Docker Socket Access
Watchtower needs access to `/var/run/docker.sock` to manage containers. This is secure on single-host deployments.

### 2. Authentication
For private Docker registries, add credentials:

```yaml
watchtower:
  environment:
    REPO_USER: your-docker-username
    REPO_PASS: your-docker-password
  # ... rest of config ...
```

### 3. Image Pull Verification
Watchtower verifies image signatures automatically.

## Troubleshooting

### Watchtower not updating

**Check if it's running:**
```bash
docker-compose ps watchtower
```

**Check logs:**
```bash
docker-compose logs watchtower
```

**Common issues:**
1. Docker socket not mounted: Verify `volumes` section
2. Container name typo: Check container names in `command`
3. Images not on Docker Hub: Verify images are pushed to registry
4. Insufficient disk space: Clean up old images

### Watchtower consuming too much resources

**Increase check interval:**
```yaml
command: --interval 3600 pisowifi-backend pisowifi-frontend  # 1 hour instead of 5 minutes
```

**Disable monitoring for less critical containers:**
```yaml
command: --interval 300 pisowifi-backend pisowifi-frontend  # Only monitor these
```

## Restart Watchtower

```bash
docker-compose restart watchtower
```

## Remove Watchtower (Disable Auto-Updates)

```bash
docker-compose down watchtower

# Or just remove it from docker-compose.prod.yml and redeploy
docker-compose up -d
```

## Best Practices

✅ **DO:**
- Monitor only critical containers (backend, frontend)
- Set reasonable update intervals (5-60 minutes)
- Enable cleanup to free up disk space
- Check logs periodically
- Have a rollback plan

❌ **DON'T:**
- Enable updates for database containers without backups
- Use very short intervals (1-2 minutes)
- Monitor too many containers
- Disable cleanups indefinitely

## Complete Workflow

```bash
# 1. Deploy with Watchtower
docker-compose -f docker-compose.prod.yml up -d

# 2. Verify Watchtower is running
docker-compose ps watchtower

# 3. Watch for updates
docker-compose logs -f watchtower

# 4. Make code changes locally
# ... edit files ...

# 5. Push to GitHub
bash sync.sh "Your message"

# 6. GitHub Actions builds and pushes image
# (automatic)

# 7. Watchtower detects new image (within 5 min)
# and auto-updates

# 8. Done! No manual intervention needed ✅
```

## Resources

- [Watchtower Documentation](https://containrrr.dev/watchtower/)
- [Docker Socket Security](https://docs.docker.com/engine/security/)
- [Watchtower GitHub](https://github.com/containrrr/watchtower)
