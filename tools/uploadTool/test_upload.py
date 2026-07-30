from __future__ import annotations

import json
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace

from tools.uploadTool.upload import (
    OssConfig,
    build_object_key,
    build_public_url,
    load_config,
    normalize_object_key,
    upload_file,
)


class FakeAuth:
    def __init__(self, access_key_id: str, access_key_secret: str) -> None:
        self.access_key_id = access_key_id
        self.access_key_secret = access_key_secret


class FakeBucket:
    last_call = None

    def __init__(self, auth: FakeAuth, endpoint: str, bucket: str) -> None:
        self.auth = auth
        self.endpoint = endpoint
        self.bucket = bucket

    def put_object_from_file(self, key: str, path: str, *, headers: dict[str, str]):
        type(self).last_call = (key, path, headers)
        return SimpleNamespace(status=200, request_id="request-123")


FAKE_OSS2 = SimpleNamespace(Auth=FakeAuth, Bucket=FakeBucket)


class UploadToolTest(unittest.TestCase):
    def setUp(self) -> None:
        self.config = OssConfig(
            access_key_id="id",
            access_key_secret="secret",
            bucket="example-bucket",
            endpoint="oss-cn-beijing.aliyuncs.com",
            public_base_url="https://example-bucket.oss-cn-beijing.aliyuncs.com",
            default_prefix="codex-uploads",
            acl="public-read",
        )

    def test_load_config(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            config_path = Path(directory) / "oss.json"
            config_path.write_text(
                json.dumps(
                    {
                        "access_key_id": "id",
                        "access_key_secret": "secret",
                        "bucket": "example-bucket",
                        "endpoint": "oss-cn-beijing.aliyuncs.com",
                        "public_base_url": "https://example-bucket.oss-cn-beijing.aliyuncs.com",
                        "default_prefix": "codex-uploads",
                        "acl": "public-read",
                    }
                ),
                encoding="utf-8",
            )

            config = load_config(config_path)

        self.assertEqual(config.bucket, "example-bucket")
        self.assertEqual(config.acl, "public-read")

    def test_build_object_key_is_unique_and_keeps_filename(self) -> None:
        key = build_object_key(
            Path("临时 文件.txt"),
            "codex-uploads",
            now=datetime(2026, 7, 24, 18, 30, 1, 42),
            unique_id="abc123",
        )
        self.assertEqual(
            key,
            "codex-uploads/2026/07/24/20260724_183001_000042_abc123_临时 文件.txt",
        )

    def test_public_url_encodes_unicode_and_spaces(self) -> None:
        url = build_public_url(self.config, "files/临时 文件.txt")
        self.assertEqual(
            url,
            "https://example-bucket.oss-cn-beijing.aliyuncs.com/"
            "files/%E4%B8%B4%E6%97%B6%20%E6%96%87%E4%BB%B6.txt",
        )

    def test_invalid_object_key_is_rejected(self) -> None:
        for key in ("", "/", "a//b", "../secret", "a/../b"):
            with self.subTest(key=key), self.assertRaises(ValueError):
                normalize_object_key(key)

    def test_upload_uses_public_acl_and_returns_result(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            local_path = Path(directory) / "example.txt"
            local_path.write_text("hello", encoding="utf-8")
            result = upload_file(
                local_path,
                "tests/example.txt",
                self.config,
                oss2_module=FAKE_OSS2,
            )

        self.assertEqual(result.status, 200)
        self.assertEqual(result.request_id, "request-123")
        self.assertEqual(
            result.url,
            "https://example-bucket.oss-cn-beijing.aliyuncs.com/tests/example.txt",
        )
        self.assertEqual(
            FakeBucket.last_call[2],
            {"Content-Type": "text/plain", "x-oss-object-acl": "public-read"},
        )


if __name__ == "__main__":
    unittest.main()
