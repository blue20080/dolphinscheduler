#!/usr/bin/env python3
"""Upload one local file to Aliyun OSS and print its public URL."""

from __future__ import annotations

import argparse
import json
import mimetypes
import sys
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from types import ModuleType
from typing import Any, Mapping, Sequence
from urllib.parse import quote


TOOL_DIR = Path(__file__).resolve().parent
DEFAULT_CONFIG_PATH = TOOL_DIR / "config" / "oss.json"
REQUIRED_CONFIG_FIELDS = (
    "access_key_id",
    "access_key_secret",
    "bucket",
    "endpoint",
    "public_base_url",
    "default_prefix",
    "acl",
)


@dataclass(frozen=True)
class OssConfig:
    access_key_id: str
    access_key_secret: str
    bucket: str
    endpoint: str
    public_base_url: str
    default_prefix: str
    acl: str


@dataclass(frozen=True)
class UploadResult:
    url: str
    bucket: str
    key: str
    file: str
    size: int
    status: int
    request_id: str


def load_config(path: Path = DEFAULT_CONFIG_PATH) -> OssConfig:
    if not path.is_file():
        raise ValueError(f"OSS 配置文件不存在: {path}")

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"无法读取 OSS 配置 {path}: {exc}") from exc

    if not isinstance(raw, Mapping):
        raise ValueError(f"OSS 配置必须是 JSON 对象: {path}")

    missing = [name for name in REQUIRED_CONFIG_FIELDS if not str(raw.get(name, "")).strip()]
    if missing:
        raise ValueError(f"OSS 配置缺少字段: {', '.join(missing)}")

    config = OssConfig(**{name: str(raw[name]).strip() for name in REQUIRED_CONFIG_FIELDS})
    if config.acl != "public-read":
        raise ValueError("当前工具只支持 public-read，以确保返回的 URL 可直接访问")
    if not config.public_base_url.startswith(("http://", "https://")):
        raise ValueError("public_base_url 必须以 http:// 或 https:// 开头")
    return config


def normalize_object_key(value: str) -> str:
    key = value.strip().replace("\\", "/").lstrip("/")
    parts = key.split("/")
    if not key or any(part in ("", ".", "..") for part in parts):
        raise ValueError(f"无效的 OSS object key: {value!r}")
    return "/".join(parts)


def build_object_key(
    local_path: Path,
    prefix: str,
    *,
    now: datetime | None = None,
    unique_id: str | None = None,
) -> str:
    normalized_prefix = normalize_object_key(prefix)
    current = now or datetime.now().astimezone()
    token = unique_id or uuid.uuid4().hex[:10]
    timestamp = current.strftime("%Y%m%d_%H%M%S_%f")
    return normalize_object_key(
        f"{normalized_prefix}/{current:%Y/%m/%d}/{timestamp}_{token}_{local_path.name}"
    )


def build_public_url(config: OssConfig, object_key: str) -> str:
    encoded_key = quote(normalize_object_key(object_key), safe="/-_.~")
    return f"{config.public_base_url.rstrip('/')}/{encoded_key}"


def import_oss2() -> ModuleType:
    try:
        import oss2
    except ImportError as exc:
        raise RuntimeError(
            "缺少 oss2，请在仓库根目录执行: "
            "./.venv/bin/python -m pip install -r requirements.txt"
        ) from exc
    return oss2


def upload_file(
    local_path: Path,
    object_key: str,
    config: OssConfig,
    *,
    content_type: str | None = None,
    oss2_module: Any | None = None,
) -> UploadResult:
    path = local_path.expanduser().resolve()
    if not path.is_file():
        raise ValueError(f"待上传文件不存在或不是普通文件: {path}")

    key = normalize_object_key(object_key)
    oss2 = oss2_module or import_oss2()
    auth = oss2.Auth(config.access_key_id, config.access_key_secret)
    bucket = oss2.Bucket(auth, config.endpoint, config.bucket)
    detected_type = content_type or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    headers = {
        "Content-Type": detected_type,
        "x-oss-object-acl": config.acl,
    }
    response = bucket.put_object_from_file(key, str(path), headers=headers)
    status = int(getattr(response, "status", 0))
    if not 200 <= status < 300:
        raise RuntimeError(f"OSS 上传失败，HTTP {status or 'unknown'}")

    return UploadResult(
        url=build_public_url(config, key),
        bucket=config.bucket,
        key=key,
        file=str(path),
        size=path.stat().st_size,
        status=status,
        request_id=str(getattr(response, "request_id", "")),
    )


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="上传一个本地文件到阿里云 OSS；成功时 stdout 只输出公开 URL。"
    )
    parser.add_argument("file", type=Path, help="待上传的本地文件路径")
    parser.add_argument("--key", help="指定 OSS object key；省略时自动生成不冲突的路径")
    parser.add_argument("--prefix", help="自动生成 object key 时使用的目录前缀")
    parser.add_argument("--content-type", help="覆盖自动识别的 Content-Type")
    parser.add_argument("--json", action="store_true", help="以 JSON 输出完整上传结果")
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG_PATH,
        help=f"OSS 配置文件，默认 {DEFAULT_CONFIG_PATH}",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = create_parser().parse_args(argv)
    try:
        config = load_config(args.config.expanduser().resolve())
        object_key = (
            normalize_object_key(args.key)
            if args.key
            else build_object_key(args.file, args.prefix or config.default_prefix)
        )
        print(f"[UPLOAD] {args.file} -> oss://{config.bucket}/{object_key}", file=sys.stderr)
        result = upload_file(
            args.file,
            object_key,
            config,
            content_type=args.content_type,
        )
    except (OSError, RuntimeError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(f"[OK] HTTP {result.status}", file=sys.stderr)
    if args.json:
        print(json.dumps(asdict(result), ensure_ascii=False, sort_keys=True))
    else:
        print(result.url)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
