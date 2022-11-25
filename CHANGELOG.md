
## [v0.0.2](https://github.com/Yunology/multi-tenancy/releases/tag/v0.0.2)  -  2022-11-25
* Add LoggerOptions to every DataSources.
* Add uuid @ BaseEntity.
* Add allowDomains mechanism in RuntimeTenant.
* Add tenantMiddleware for module use.
* Add TenantEntity for module to add tenant labeled data in database.
* Flatten Tenant data in RuntimeTenant.
* Remove Infrastructure#getManyByIds since it can do with getMany method.(#3)
* Fix incorrect Infrastructure#update logic.(#4)

## [v0.0.1](https://github.com/Yunology/multi-tenancy/releases/tag/v0.0.1)  -  2022-11-16
Init of whole project, including first version of Multi-Tenancy.
