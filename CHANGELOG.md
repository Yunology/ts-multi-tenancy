## [v0.0.7](https://github.com/Yunology/ts-multi-tenancy/releases/tag/v0.0.7)  -  2023-01-17
### Added
- Open source with MIT license.

## [v0.0.6](https://github.com/Yunology/ts-multi-tenancy/releases/tag/v0.0.6)  -  2022-12-30
### Fixed
- Incorrect module type @ TenantPlanInfo cause init error at invoker.

## [v0.0.5](https://github.com/Yunology/ts-multi-tenancy/releases/tag/v0.0.4)  -  2022-12-20
### Added
- Permission & Config generic type @ Service & DataService.
### Fixed
- Broken Service#clone method, replace to old one.

## [v0.0.4](https://github.com/Yunology/ts-multi-tenancy/releases/tag/v0.0.4)  -  2022-12-04
### Fixed
- Tenant not init when create.(#10)

## [v0.0.3](https://github.com/Yunology/ts-multi-tenancy/releases/tag/v0.0.3)  -  2022-11-26
### Added
- Auth helper for SignInRequire decorator.(#8)
- Permission helper for PermissionRequire decorator.(#7)

## [v0.0.2](https://github.com/Yunology/ts-multi-tenancy/releases/tag/v0.0.2)  -  2022-11-25
### Added
- LoggerOptions to every DataSources.
- UUID @ BaseEntity.
- allowDomains mechanism in RuntimeTenant.
- tenantMiddleware for module use.
- TenantEntity for module to add tenant labeled data in database.(#4)

### Misc
- Flatten Tenant data in RuntimeTenant.(#2)
- Remove Infrastructure#getManyByIds since it can do with getMany method.(#3)

### Fixed
- Incorrect Infrastructure#update logic.(#4)

## [v0.0.1](https://github.com/Yunology/ts-multi-tenancy/releases/tag/v0.0.1)  -  2022-11-16
Init of whole project, including first version of Multi-Tenancy.
