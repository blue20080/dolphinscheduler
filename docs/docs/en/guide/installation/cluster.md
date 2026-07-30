# Cluster Deployment

Cluster deployment runs ETL services on multiple machines for production workloads.

For a quick evaluation, start with [Standalone deployment](standalone.md). For a complete single-machine environment, use [pseudo-cluster deployment](pseudo-cluster.md). Use cluster deployment for production.

## Deployment Steps

Cluster deployment uses the same scripts and configuration files as [pseudo-cluster deployment](pseudo-cluster.md), so the preparation and deployment steps are the same as pseudo-cluster deployment. The difference is that pseudo-cluster deployment is for one machine, while cluster deployment (Cluster) is for multiple machines. And steps of "Modify Configuration" are quite different between pseudo-cluster deployment and cluster deployment.

### Prerequisites and ETL Startup Environment Preparations

Distribute the installation package to each server of each cluster and perform all the steps in [pseudo-cluster deployment](pseudo-cluster.md) on each machine.

> **_NOTICE:_** Make sure that the configuration files on each machine are consistent, otherwise the cluster will not work properly.
> **_NOTICE:_** Each service is stateless and independent of each other, so you can deploy multiple services on each machine, but you need to pay attention to port conflicts.
> **_NOTICE:_** ETL currently uses the internal compatibility path `/tmp/dolphinscheduler` as the default resource directory. Change the resource settings in `conf/common.properties` when another location is required.

### Modify Configuration

This step differs quite a lot from [pseudo-cluster deployment](pseudo-cluster.md), please use `scp` or other methods to distribute the configuration files to each machine, then modify the configuration files.

## Start and Login to ETL

Same as [pseudo-cluster](pseudo-cluster.md)

## Start and Stop Server

Same as [pseudo-cluster](pseudo-cluster.md)
