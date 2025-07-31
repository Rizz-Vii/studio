# Firebase Hosting Configuration for Branch-Specific Deployments

## Branch Strategy

- **Master Branch**: Production deployment → `https://rankpilot-h3jpc.web.app`
- **feature/performance-optimization-mobile-enhancement**: Performance testing → `https://rankpilot-h3jpc--performance-testing-mw0cwov5.web.app`

## Deployment Commands

### Performance Testing Branch (Current)

```bash
# Deploy to preview channel (automatic with GitHub Actions)
firebase hosting:channel:deploy performance-testing --project rankpilot-h3jpc

# Manual deploy to preview channel
firebase deploy --project rankpilot-h3jpc --only hosting:performance-testing
```

### Production Deployment (Master Branch)

```bash
# Deploy to production (automatic with GitHub Actions on master)
firebase deploy --project rankpilot-h3jpc --only hosting

# Manual production deploy
firebase deploy --project rankpilot-h3jpc --only hosting:production
```

## GitHub Actions Workflow

The deployment is automated via GitHub Actions:

- Push to `feature/performance-optimization-mobile-enhancement` → Performance testing channel
- Push to `master` → Production deployment

## Environment Configuration

- Performance testing: Uses `.env.performance-testing` configuration
- Production: Uses production environment variables

## URLs Updated

All test configurations and environment files have been updated to use:
`https://rankpilot-h3jpc--performance-testing-mw0cwov5.web.app`

## Next Steps

1. Push changes to trigger automatic deployment
2. Run tests against performance testing environment
3. Validate all features work correctly
4. Merge to master for production deployment
