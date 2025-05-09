#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname "$0") && pwd)
PARENT_DIR=$(cd "$BASE_DIR/.." && pwd)
PROJECT_DIR="$PARENT_DIR/controller-web"

# Load the environment variables
source "$BASE_DIR/secrets/aws.env"

# Build the project
cd "$PROJECT_DIR"
npm run build
DIST_DIR="$PROJECT_DIR/dist"

# Initialize aws credentials
export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$AWS_DEFAULT_REGION"

# Upload the build to S3
BUCKET_NAME="gyrodrop-controller-web"
echo "Deleting old files from S3 bucket..."
aws s3 rm "s3://$BUCKET_NAME/" --recursive
echo "Uploading new files to S3 bucket..."
aws s3 cp "$DIST_DIR/" "s3://$BUCKET_NAME/" --recursive

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id "$AWS_DISTRIBUTION_ID_CONTROLLER_GYRODROP_XYZ" \
    --paths "/*"

echo "Completed deployment to S3 bucket $BUCKET_NAME"
