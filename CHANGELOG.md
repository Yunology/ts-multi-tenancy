## [v0.0.3](https://github.com/Yunology/multi-tenancy/releases/tag/v0.0.3)  -  2022-11-26
### Added
- Permission helper for PermissionRequire decorator
- Auth helper for SignInRequire decorator

## [v0.0.2](https://github.com/Yunology/multi-tenancy/releases/tag/v0.0.2)  -  2022-11-25
### Added
- LoggerOptions to every DataSources.
- UUID @ BaseEntity.
- allowDomains mechanism in RuntimeTenant.
- tenantMiddleware for module use.
- TenantEntity for module to add tenant labeled data in database.

### Misc
- Flatten Tenant data in RuntimeTenant.
- Remove Infrastructure#getManyByIds since it can do with getMany method.(#3)

### Fix
- Incorrect Infrastructure#update logic.(#4)

## [v0.0.1](https://github.com/Yunology/multi-tenancy/releases/tag/v0.0.1)  -  2022-11-16
Init of whole project, including first version of Multi-Tenancy.
