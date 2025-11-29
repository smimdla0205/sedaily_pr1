import json
import subprocess
import sys

CLOUDFRONT_ID = "E3F0F24DE4JESO"

print("🔧 CloudFront에 SPA 라우팅 설정 추가 중...")

# 현재 설정 가져오기
result = subprocess.run(
    ["aws", "cloudfront", "get-distribution-config", "--id", CLOUDFRONT_ID],
    capture_output=True, text=True
)

if result.returncode != 0:
    print(f"❌ 설정 가져오기 실패: {result.stderr}")
    sys.exit(1)

config_data = json.loads(result.stdout)
etag = config_data["ETag"]
dist_config = config_data["DistributionConfig"]

# CustomErrorResponses 추가
dist_config["CustomErrorResponses"] = {
    "Quantity": 2,
    "Items": [
        {
            "ErrorCode": 403,
            "ResponsePagePath": "/index.html",
            "ResponseCode": "200",
            "ErrorCachingMinTTL": 300
        },
        {
            "ErrorCode": 404,
            "ResponsePagePath": "/index.html",
            "ResponseCode": "200",
            "ErrorCachingMinTTL": 300
        }
    ]
}

# DefaultRootObject 설정
dist_config["DefaultRootObject"] = "index.html"

# 임시 파일에 저장
import tempfile
import os
temp_file = os.path.join(tempfile.gettempdir(), "cf-config-updated.json")
with open(temp_file, "w") as f:
    json.dump(dist_config, f, indent=2)

# 설정 업데이트
result = subprocess.run(
    [
        "aws", "cloudfront", "update-distribution",
        "--id", CLOUDFRONT_ID,
        "--distribution-config", f"file://{temp_file}",
        "--if-match", etag
    ],
    capture_output=True, text=True
)

if result.returncode != 0:
    print(f"❌ 설정 업데이트 실패: {result.stderr}")
    sys.exit(1)

print("✅ SPA 라우팅 설정 완료!")
print("   - 403/404 에러 → index.html 반환")
print("   - DefaultRootObject: index.html")
print("⏳ 변경사항 배포 중... (5-10분 소요)")
