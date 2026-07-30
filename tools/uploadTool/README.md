# uploadTool 阿里云 OSS 上传工具

`uploadTool` 用于把任意本地文件上传到阿里云 OSS，并返回可直接访问的公开 URL。它不依赖 DataSophon 的目录结构，可从仓库内任意工作目录调用。

OSS 配置保存在本机的 `config/oss.json`，该文件不会提交到仓库。首次使用时，请参考 `config/oss.example.json` 创建本机配置。

## 安装依赖

仓库统一使用根目录虚拟环境：

```bash
./.venv/bin/python -m pip install -r requirements.txt
```

## 上传文件

在仓库根目录执行：

```bash
./.venv/bin/python tools/uploadTool/upload.py /absolute/path/to/file
```

默认会在 `codex-uploads/YYYY/MM/DD/` 下生成带时间和随机标识的 object key，避免覆盖同名文件。上传进度写入 `stderr`，成功后的公开 URL 单独写入 `stdout`，可以直接赋值：

```bash
url="$(./.venv/bin/python tools/uploadTool/upload.py /tmp/example.txt)"
printf '%s\n' "$url"
```

指定固定 object key：

```bash
./.venv/bin/python tools/uploadTool/upload.py \
  /tmp/example.txt \
  --key examples/example.txt
```

指定目录前缀：

```bash
./.venv/bin/python tools/uploadTool/upload.py \
  /tmp/example.txt \
  --prefix temporary-files
```

同一个 `--key` 再次上传会覆盖 OSS 中的同名对象；不需要覆盖时使用默认自动路径。

## Codex 调用约定

当用户要求“使用 uploadTool 上传 `<文件路径>`”时，Codex 直接执行：

```bash
./.venv/bin/python tools/uploadTool/upload.py "<文件路径>"
```

命令退出码为 `0` 时，将 stdout 中的 URL 原样返回给用户。需要上传详情时使用 `--json`：

```bash
./.venv/bin/python tools/uploadTool/upload.py "<文件路径>" --json
```

JSON 包含 `url`、`bucket`、`key`、本地文件路径、大小、HTTP 状态和 OSS request ID。

## 配置

配置文件：`tools/uploadTool/config/oss.json`

可从 `tools/uploadTool/config/oss.example.json` 复制后填写实际值：

```json
{
  "access_key_id": "your-access-key-id",
  "access_key_secret": "your-access-key-secret",
  "bucket": "your-bucket",
  "endpoint": "oss-cn-beijing.aliyuncs.com",
  "public_base_url": "https://your-bucket.oss-cn-beijing.aliyuncs.com",
  "default_prefix": "codex-uploads",
  "acl": "public-read"
}
```

工具固定使用 `public-read` 上传对象，以保证返回的 URL 无需签名即可访问。

## 测试

```bash
./.venv/bin/python -m unittest tools.uploadTool.test_upload
```
