#!/bin/bash

# 빠른 프론트엔드 재배포 스크립트
set -e

# 설정 파일 확인
if [ ! -f "config.sh" ]; then
    echo "❌ config.sh 파일이 없습니다. 먼저 ./init.sh를 실행하세요."
    exit 1
fi

source config.sh

echo "========================================="
echo "   🚀 빠른 프론트엔드 재배포"
echo "   스택: ${STACK_NAME}"
echo "   환경: PRE-PR1"
echo "========================================="

# CloudFront Distribution ID 사용 (config.sh에서 가져옴)
if [ -z "$CLOUDFRONT_ID" ]; then
    echo "⚠️  CloudFront Distribution ID가 설정되지 않았습니다."
    echo "config.sh에서 CLOUDFRONT_ID를 확인하세요."
    exit 1
fi

echo "📋 배포 정보:"
echo "   S3 버킷: ${S3_BUCKET}"
echo "   CloudFront ID: ${CLOUDFRONT_ID}"
echo "   CloudFront 도메인: ${CLOUDFRONT_DOMAIN}"
echo "   커스텀 도메인: ${CUSTOM_DOMAIN}"
echo ""

# 프론트엔드 디렉토리로 이동
cd ../frontend

echo "🔨 [1/3] 프론트엔드 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi

echo ""
echo "📤 [2/3] S3에 업로드 중..."
aws s3 sync dist/ s3://${S3_BUCKET} --delete --region ${REGION}

if [ $? -ne 0 ]; then
    echo "❌ S3 업로드 실패"
    exit 1
fi

echo ""
echo "🔄 [3/3] CloudFront 캐시 무효화 중..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id ${CLOUDFRONT_ID} \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ 캐시 무효화 시작: ${INVALIDATION_ID}"
else
    echo "⚠️  캐시 무효화 실패 (수동으로 진행하세요)"
fi

# scripts-v2 디렉토리로 복귀
cd ../scripts-v2

echo ""
echo "========================================="
echo "✅ 프론트엔드 재배포 완료!"
echo "========================================="
echo ""
echo "🌐 접속 URL:"
echo "   CloudFront: https://${CLOUDFRONT_DOMAIN}"
echo "   커스텀 도메인: https://${CUSTOM_DOMAIN}"
echo ""
echo "⏳ 변경사항이 반영되기까지 1-2분 소요됩니다."
echo "========================================="
