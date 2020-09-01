#!/bin/bash

# usage: sh build-deploy-api.sh <hostname>
# example: sh build-deploy-api.sh api.geoawareness.woolpert.dev

PROJECT_ID=$(gcloud config get-value project)
HOSTNAME=$1

# substitute service definition file variables
echo "\nSubstituting variables into service definition file."
BACKEND_SERVICES_ADDRESS=$(gcloud run services list --platform managed --filter=geoawareness-backend --format="value(URL)")
sed \
    -e "s|\${BACKEND_SERVICES_ADDRESS}|"$BACKEND_SERVICES_ADDRESS"|" \
    -e "s|\${HOSTNAME}|'"$HOSTNAME"'|" \
    geoawareness-api.yaml > geoawareness-api-touched.yaml

# enable Cloud Endpoints
echo "\nDeploying API definition to Cloud Endpoints"
gcloud services enable endpoints.googleapis.com
gcloud endpoints services deploy geoawareness-api-touched.yaml
gcloud services enable $HOSTNAME

# build and deploy new image with Cloud Endpoints ESPv2
echo "\nDeploying new API image for service $HOSTNAME, Endpoints config $CONFIG_ID to Cloud Run"
CONFIG_ID=$(gcloud endpoints configs list --service $HOSTNAME --sort-by ~id --limit 1 --format="value(id)")

./build/gcloud_build_image -s $HOSTNAME -c $CONFIG_ID -p $PROJECT_ID
gcloud run deploy geoawareness-api \
  --image="gcr.io/$PROJECT_ID/endpoints-runtime-serverless:$HOSTNAME-$CONFIG_ID" \
  --set-env-vars=ESPv2_ARGS=--cors_preset=basic \
  --allow-unauthenticated \
  --platform managed \
  --project $PROJECT_ID