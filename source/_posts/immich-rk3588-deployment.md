---
title: 在 RK3588 小主机上部署 Immich 开源相册服务
date: 2026-02-12 12:48:43
author: Mahoo12138
tags: 
- Immich
- RK3588
categories:
- 技术教程
---



# 在 RK3588 小主机上部署 Immich 开源相册服务

## 前言

最近在我的 RK3588 小主机上成功部署了 Immich——一个高性能的开源照片和视频管理解决方案。Immich 可以作为 Google Photos 的完美替代品，支持自动备份、人脸识别、智能搜索等功能。本文将详细记录整个部署过程，特别是如何充分利用 RK3588 的硬件加速能力。

## 硬件环境

- **主机**: RK3588 小主机
- **操作系统**: OpenMediaVault (基于 Debian)
- **存储**: ZFS 文件系统
- **处理器**: RK3588 (8核心，包含 NPU 和硬件编解码器)
- **内存**: 推荐 8GB 及以上

## 为什么选择 RK3588？

RK3588 芯片的优势在于：

1. **强大的 NPU**: 6 TOPS 算力，可以加速机器学习任务（人脸识别、物体检测等）
2. **硬件编解码**: 支持 H.264/H.265 硬件加速转码，显著降低 CPU 负载
3. **低功耗**: 相比 x86 平台，功耗更低，适合 7x24 小时运行
4. **性价比**: 价格亲民，性能足够家庭使用

## 部署步骤

### 1. 准备工作

首先确保系统已安装 Docker 和 Docker Compose：

```bash
# 检查 Docker 版本
docker --version
docker compose version
```

创建项目目录：

```bash
mkdir -p ~/immich
cd ~/immich
```

### 2. 配置文件准备

#### 2.1 主配置文件 (docker-compose.yml)

创建 `immich.yml` 文件（如果使用 OpenMediaVault，可以通过 Web UI 管理）：

```yaml
name: immich

services:
  immich-server:
    container_name: immich_server
    image: ghcr.io/immich-app/immich-server:${IMMICH_VERSION:-release}
    extends:
       file: hwaccel.transcoding.yml
       service: rkmpp  # 使用 RK3588 硬件加速
    volumes:
      - ${UPLOAD_LOCATION}:/data
      - /etc/localtime:/etc/localtime:ro
    env_file:
      - immich.env
    ports:
      - '2283:2283'
    depends_on:
      - redis
      - database
    restart: always
    healthcheck:
      disable: false

  immich-machine-learning:
    container_name: immich_machine_learning
    # 使用 rknn 标签获得 NPU 加速支持
    image: ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION:-release}-rknn
    extends:
       file: hwaccel.ml.yml
       service: rknn  # 使用 RKNN NPU 加速
    volumes:
      - model-cache:/cache
    env_file:
      - immich.env
    restart: always
    healthcheck:
      disable: false

  redis:
    container_name: immich_redis
    image: docker.io/valkey/valkey:8-bookworm
    healthcheck:
      test: redis-cli ping || exit 1
    restart: always

  database:
    container_name: immich_postgres
    image: ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_DB: ${DB_DATABASE_NAME}
      POSTGRES_INITDB_ARGS: '--data-checksums'
    volumes:
      - ${DB_DATA_LOCATION}:/var/lib/postgresql/data
    shm_size: 128mb
    restart: always

volumes:
  model-cache:
```

#### 2.2 环境变量配置 (immich.env)

创建 `immich.env` 文件：

```env
# 照片和视频存储位置
UPLOAD_LOCATION=/ZfsVaultMount/Photos

# 数据库存储位置
DB_DATA_LOCATION=/ZfsVaultMount/DockerData/immich/postgres

# 时区设置
TZ=Europe/Rome

# Immich 版本
IMMICH_VERSION=release

# 数据库密码（请修改为强密码）
DB_PASSWORD=your_secure_password_here

# RKNN 线程数配置
# 根据实际情况调整，建议设置为 2-4
MACHINE_LEARNING_RKNN_THREADS=2

# 数据库配置
DB_USERNAME=postgres
DB_DATABASE_NAME=immich
```

**重要提示**:
- `UPLOAD_LOCATION`: 照片存储路径，建议使用大容量存储
- `DB_DATA_LOCATION`: 数据库路径，建议放在 SSD 上以提升性能
- `MACHINE_LEARNING_RKNN_THREADS`: RKNN 线程数，RK3588 建议设置为 2

#### 2.3 硬件加速配置 - 转码 (hwaccel.transcoding.yml)

创建 `hwaccel.transcoding.yml` 文件：

```yaml
services:
  cpu: {}

  nvenc:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities:
                - gpu
                - compute
                - video

  quicksync:
    devices:
      - /dev/dri:/dev/dri

  rkmpp:
    security_opt:
      - systempaths=unconfined
      - apparmor=unconfined
    group_add:
      - video
    devices:
      - /dev/rga:/dev/rga
      - /dev/dri:/dev/dri
      - /dev/dma_heap:/dev/dma_heap
      - /dev/mpp_service:/dev/mpp_service
      - /dev/mali0:/dev/mali0
    volumes:
      - /etc/OpenCL:/etc/OpenCL:ro
      - /usr/lib/aarch64-linux-gnu/libmali.so.1:/usr/lib/aarch64-linux-gnu/libmali.so.1:ro

  vaapi:
    devices:
      - /dev/dri:/dev/dri

  vaapi-wsl:
    devices:
      - /dev/dri:/dev/dri
      - /dev/dxg:/dev/dxg
    volumes:
      - /usr/lib/wsl:/usr/lib/wsl
    environment:
      - LIBVA_DRIVER_NAME=d3d12
```

**RKMPP 配置说明**:
- `/dev/rga`: 2D 图形加速器
- `/dev/mpp_service`: 媒体处理平台服务
- `/dev/mali0`: Mali GPU（用于 OpenCL HDR 到 SDR 色调映射）
- 需要挂载 Mali 库以支持 OpenCL 加速

#### 2.4 硬件加速配置 - 机器学习 (hwaccel.ml.yml)

创建 `hwaccel.ml.yml` 文件：

```yaml
services:
  armnn:
    devices:
      - /dev/mali0:/dev/mali0
    volumes:
      - /lib/firmware/mali_csffw.bin:/lib/firmware/mali_csffw.bin:ro
      - /usr/lib/libmali.so:/usr/lib/libmali.so:ro
  
  rknn:
    security_opt:
      - systempaths=unconfined
      - apparmor=unconfined
    devices:
      - /dev/dri:/dev/dri

  cpu: {}

  cuda:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities:
                - gpu

  rocm:
    group_add:
      - video
    devices:
      - /dev/dri:/dev/dri
      - /dev/kfd:/dev/kfd

  openvino:
    device_cgroup_rules:
      - 'c 189:* rmw'
    devices:
      - /dev/dri:/dev/dri
    volumes:
      - /dev/bus/usb:/dev/bus/usb

  openvino-wsl:
    devices:
      - /dev/dri:/dev/dri
      - /dev/dxg:/dev/dxg
    volumes:
      - /dev/bus/usb:/dev/bus/usb
      - /usr/lib/wsl:/usr/lib/wsl
```

### 3. 启动服务

```bash
# 进入项目目录
cd ~/immich

# 启动所有服务
docker compose -f immich.yml up -d

# 查看日志
docker compose -f immich.yml logs -f

# 检查服务状态
docker compose -f immich.yml ps
```

### 4. 初始化设置

1. 访问 `http://your-server-ip:2283`
2. 创建管理员账户
3. 在移动端下载 Immich App 并配置自动备份

## 关键配置说明

### 硬件加速的重要性

在 RK3588 上启用硬件加速是获得良好性能的关键：

#### 转码加速 (RKMPP)

- **不使用硬件加速**: CPU 使用率可达 80-100%，转码速度慢，发热严重
- **使用 RKMPP 加速**: CPU 使用率降至 10-20%，转码速度提升 3-5 倍

在 Immich Web 界面中启用硬件转码：
1. 进入 `管理` → `视频转码设置`
2. 选择 `硬件加速`: **RKMPP**
3. 设置目标分辨率和码率

#### 机器学习加速 (RKNN)

RKNN 是 Rockchip 的 NPU 推理框架，可以大幅加速：
- 人脸识别
- 物体检测
- 智能标签生成
- CLIP 文本-图像搜索

**性能对比**:
- CPU 推理: ~2-3 张图片/秒
- RKNN NPU 加速: ~8-12 张图片/秒

### ZFS 存储优化

如果使用 ZFS 文件系统，建议优化设置：

```bash
# 为照片数据集设置合适的 recordsize
zfs set recordsize=1M tank/photos

# 启用压缩（JPEG/视频压缩效果有限，但可以节省数据库空间）
zfs set compression=lz4 tank/photos

# 禁用 atime 以提升性能
zfs set atime=off tank/photos
```

### 数据库性能优化

对于大型照片库（10 万+ 照片），建议：

1. 将数据库放在 SSD 上
2. 增加 PostgreSQL 的 shared memory：

```yaml
database:
  shm_size: 256mb  # 默认 128mb，可以根据内存大小调整
```

## 性能表现

在我的 RK3588 小主机上，处理 1.2 TB Google Takeout 数据的表现：

- **初始导入速度**: 约 50-80 GB/小时（取决于文件大小和数量）
- **人脸识别**: ~10 张图片/秒（使用 RKNN）
- **智能搜索**: 响应时间 < 1 秒
- **视频转码**: 4K@30fps → 1080p@30fps，实时率约 1.5x
- **功耗**: 整机约 15-25W（包括硬盘）
- **内存占用**: 
  - immich-server: ~500MB
  - immich-machine-learning: ~800MB
  - postgres: ~200MB
  - redis: ~50MB

## 常见问题和解决方案

### 1. 设备权限问题

如果遇到 `/dev/mpp_service` 或其他设备访问被拒绝：

```bash
# 检查设备权限
ls -l /dev/mpp_service /dev/rga /dev/dri

# 添加 docker 用户到 video 组
sudo usermod -aG video $USER

# 重启 Docker 服务
sudo systemctl restart docker
```

### 2. RKNN 初始化失败

确保系统内核支持 RKNN：

```bash
# 检查 NPU 设备
ls -l /dev/dri/renderD*

# 查看内核模块
lsmod | grep rknpu
```

### 3. 内存不足

如果内存较小（< 8GB），可以：

```bash
# 限制机器学习容器的内存使用
docker update --memory=2g immich_machine_learning

# 或在 docker-compose.yml 中添加：
immich-machine-learning:
  deploy:
    resources:
      limits:
        memory: 2G
```

### 4. 转码失败

检查硬件加速是否正常工作：

```bash
# 进入容器检查
docker exec -it immich_server bash

# 测试 MPP 编码器
ffmpeg -hwaccels
ffmpeg -encoders | grep rkmpp
```

### 5. 数据库连接慢

对于 HDD 存储的数据库，在 docker-compose.yml 中添加：

```yaml
database:
  environment:
    DB_STORAGE_TYPE: 'HDD'  # 针对机械硬盘优化
```

## 备份策略

### 数据备份

定期备份关键数据：

```bash
# 备份照片（增量备份）
rsync -avh --progress /ZfsVaultMount/Photos /backup/location/

# 备份数据库
docker exec immich_postgres pg_dump -U postgres immich > immich_backup_$(date +%Y%m%d).sql
```

### 配置备份

```bash
# 备份所有配置文件
tar -czf immich_config_$(date +%Y%m%d).tar.gz \
  immich.yml \
  immich.env \
  hwaccel.transcoding.yml \
  hwaccel.ml.yml
```

## 更新升级

```bash
# 停止服务
docker compose -f immich.yml down

# 拉取最新镜像
docker compose -f immich.yml pull

# 启动服务
docker compose -f immich.yml up -d

# 查看日志确认正常
docker compose -f immich.yml logs -f
```

## 监控和维护

### 容器监控

```bash
# 查看容器资源占用
docker stats

# 查看特定容器日志
docker logs immich_server --tail 100 -f
```

### 数据库维护

```bash
# 进入数据库容器
docker exec -it immich_postgres psql -U postgres -d immich

# 查看数据库大小
SELECT pg_size_pretty(pg_database_size('immich'));

# 查看表大小
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

# 优化数据库
VACUUM ANALYZE;
```

## 总结

在 RK3588 小主机上部署 Immich 是一个非常值得的选择。通过合理配置硬件加速，可以获得：

✅ **优秀的性能**: NPU 和硬件编解码器大幅提升处理速度  
✅ **低功耗**: 相比 x86 方案，功耗更低，更环保  
✅ **高性价比**: 硬件成本低，性能够用  
✅ **完整功能**: 支持人脸识别、智能搜索、自动备份等全部功能  
✅ **隐私安全**: 数据完全掌握在自己手中  

对于家庭用户来说，RK3588 + Immich 是替代 Google Photos 等云服务的理想方案。

## 参考资料

- [Immich 官方文档](https://docs.immich.app/)
- [硬件转码配置](https://docs.immich.app/features/hardware-transcoding)
- [机器学习硬件加速](https://docs.immich.app/features/ml-hardware-acceleration)
- [RK3588 官方文档](https://www.rock-chips.com/a/en/products/RK35_Series/2022/0926/1660.html)

## 更新日志

- **2025-02**: 初始部署，配置硬件加速
- 持续优化中...

---

*如有问题或建议，欢迎交流讨论！*
