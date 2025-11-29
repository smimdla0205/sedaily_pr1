#!/bin/bash

# 프론트엔드 배포 스크립트 (S3 + CloudFront)
set -e

# 설정 파일 확인
if [ ! -f "config.sh" ]; then
    echo "❌ config.sh 파일이 없습니다. 먼저 ./init.sh를 실행하세요."
    exit 1
fi

source config.sh

echo "========================================="
echo "   프론트엔드 배포 시작"
echo "   스택: ${STACK_NAME}"
echo "========================================="

# 1. S3 버킷 생성
echo "📦 S3 버킷 생성: ${S3_BUCKET}"

# us-east-1은 LocationConstraint 불필요
if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket \
        --bucket ${S3_BUCKET} \
        --region ${REGION} 2>&1 | grep -E "(BucketAlreadyExists|BucketAlreadyOwnedByYou)" && echo "버킷 이미 존재" || true
else
    aws s3api create-bucket \
        --bucket ${S3_BUCKET} \
        --region ${REGION} \
        --create-bucket-configuration LocationConstraint=${REGION} 2>&1 | grep -E "(BucketAlreadyExists|BucketAlreadyOwnedByYou)" && echo "버킷 이미 존재" || true
fi

echo "✅ S3 버킷 준비 완료"

# S3 버킷 정책 설정 (CloudFront OAC 사용)
echo "🔒 S3 버킷 정책 설정"
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontOAC",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${S3_BUCKET}/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceAccount": "${ACCOUNT_ID}"
                }
            }
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket ${S3_BUCKET} \
    --policy file:///tmp/bucket-policy.json \
    --region ${REGION} 2>/dev/null || true

# 2. Origin Access Control 생성
echo "🔑 OAC 생성"

# OAC 설정을 JSON 파일로 생성
cat > /tmp/oac-config.json << EOF
{
    "Name": "${STACK_NAME}-oac",
    "Description": "OAC for ${STACK_NAME}",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
}
EOF

# OAC 생성 또는 기존 OAC ID 가져오기
OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config file:///tmp/oac-config.json \
    --query 'OriginAccessControl.Id' \
    --output text 2>/dev/null || \
    aws cloudfront list-origin-access-controls \
        --query "OriginAccessControlList.Items[?Name=='${STACK_NAME}-oac'].Id | [0]" \
        --output text)

echo "OAC ID: ${OAC_ID}"

# 3. CloudFront 배포 생성 또는 기존 배포 사용
echo "☁️ CloudFront 배포 확인"

# 기존 CloudFront ID가 설정되어 있는지 확인
if [ -n "$CLOUDFRONT_ID" ] && [ "$CLOUDFRONT_ID" != "None" ]; then
    echo "✅ 기존 CloudFront 배포 사용: ${CLOUDFRONT_ID}"
    DISTRIBUTION_ID=$CLOUDFRONT_ID
    
    # CloudFront 도메인 가져오기
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id ${DISTRIBUTION_ID} \
        --query 'Distribution.DomainName' \
        --output text)
    
    echo "   CloudFront 도메인: ${CLOUDFRONT_DOMAIN}"
    echo "   커스텀 도메인: ${CUSTOM_DOMAIN}"
    
    # CloudFront 배포 생성 단계 건너뛰기
    SKIP_CF_CREATION=true
else
    echo "📝 새 CloudFront 배포 생성"
    SKIP_CF_CREATION=false
fi

if [ "$SKIP_CF_CREATION" = false ]; then
    # CloudFront 설정을 JSON 파일로 생성
    cat > /tmp/distribution-config.json << EOF
{
    "CallerReference": "${STACK_NAME}-$(date +%s)",
    "Comment": "${STACK_NAME} frontend",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-${S3_BUCKET}",
                "DomainName": "${S3_BUCKET}.s3.${REGION}.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                },
                "OriginAccessControlId": "${OAC_ID}"
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${S3_BUCKET}",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["HEAD", "GET"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["HEAD", "GET"]
            }
        },
        "Compress": true,
        "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
    },
    "CustomErrorResponses": {
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
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

    # CloudFront 배포 생성 또는 기존 ID 가져오기
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/distribution-config.json \
        --query 'Distribution.Id' \
        --output text 2>/dev/null || \
        aws cloudfront list-distributions \
            --query "DistributionList.Items[?Comment=='${STACK_NAME} frontend'].Id | [0]" \
            --output text)

    # CloudFront 도메인 가져오기
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id ${DISTRIBUTION_ID} \
        --query 'Distribution.DomainName' \
        --output text)
fi

# 4. 프론트엔드 빌드 및 업로드
echo "🔨 프론트엔드 빌드"
cd ../frontend
npm install
npm run build

echo "📤 S3에 업로드"
aws s3 sync dist/ s3://${S3_BUCKET}/ --delete

# 5. CloudFront 캐시 무효화
echo "🔄 CloudFront 캐시 무효화"
aws cloudfront create-invalidation \
    --distribution-id ${DISTRIBUTION_ID} \
    --paths "/*" > /dev/null

# 결과 출력
echo ""
echo "========================================="
echo "✅ 프론트엔드 배포 완료!"
echo "========================================="
echo ""
echo "📋 배포 정보:"
echo "환경: PRE-PR1"
echo "스택 이름: ${STACK_NAME}"
echo "S3 버킷: ${S3_BUCKET}"
echo "CloudFront ID: ${DISTRIBUTION_ID}"
echo ""
echo "🌐 접속 URL:"
echo "CloudFront: https://${CLOUDFRONT_DOMAIN}"
if [ -n "$CUSTOM_DOMAIN" ]; then
    echo "커스텀 도메인: https://${CUSTOM_DOMAIN}"
fi
echo ""
echo "⏳ CloudFront 배포가 완료되기까지 약 5-10분 소요됩니다."

# 배포 정보 저장
cat > deployment-info.txt << EOF
ENVIRONMENT=PRE-PR1
STACK_NAME=${STACK_NAME}
S3_BUCKET=${S3_BUCKET}
CLOUDFRONT_ID=${DISTRIBUTION_ID}
CLOUDFRONT_URL=https://${CLOUDFRONT_DOMAIN}
CUSTOM_DOMAIN=https://${CUSTOM_DOMAIN}
REGION=${REGION}
DEPLOYED_AT=$(date)
EOF

echo ""
echo "배포 정보가 deployment-info.txt에 저장되었습니다."