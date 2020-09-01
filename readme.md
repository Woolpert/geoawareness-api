# GeoAwareness REST API

The REST API provides access to the GeoAwareness data model and telemetry event ingest services.

## Run Locally

Running the API locally is useful for testing and debugging. Download the service account credentials created when standing up the [geoawareness-geofencing](https://github.com/woolpert-googlecloud/geoawareness-geofencing) service.

```
export GOOGLE_APPLICATION_CREDENTIALS=geoawareness-service-account-credentials.json

nvm use
npm install
npm start
```

The API is available at [http://locahost:8080](http://localhost:8080).

## Deploy to GCP

### Backend Services

```
gcloud services enable servicemanagement.googleapis.com
gcloud services enable servicecontrol.googleapis.com
```

```
gcloud builds submit --tag gcr.io/$PROJECT_ID/geoawareness-backend
gcloud run deploy geoawareness-backend --image gcr.io/$PROJECT_ID/geoawareness-backend --no-allow-unauthenticated --platform managed
```

### API

#### Authentication

[API key authentication](https://cloud.google.com/endpoints/docs/openapi/authentication-method#api_keys) is configured for Cloud Endpoints as specified in [geoawareness-api.yaml](./geoawareness-api.yaml#L17). This is a simple encrypted string and admittedly subject to man-in-the-middle-attacks. For a production deployment, we recommend implementing additional [authentication scheme(s)](https://cloud.google.com/endpoints/docs/openapi/authentication-method) that align with your existing client application authentication patterns. API key authentication alone is not enough if the API calls contain user data.

#### Deploy

The instructions [here](https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run#configure_es) to deploy the ESP to Cloud Run have been compiled into a build script. Everytime you modify and redeploy the Endpoints service configuration, you must re-run this entire step. Otherwise, changes to the service configuration will not be propagated to ESPv2 Beta.

```
sh build/build-deploy-api.sh <hostname> # Example: api.geoawareness.woolpert.dev
```

#### Map Custom Domain (Optional)

See these [instructions](https://cloud.google.com/run/docs/mapping-custom-domains#command-line) to map a custom domain to the 'host' value in the service definition file.

```
gcloud beta run domain-mappings create --service geoawareness-api --domain <hostname> --platform managed # Example: api.geoawareness.woolpert.dev
```

Add [DNS records](https://cloud.google.com/run/docs/mapping-custom-domains#dns_update) at your domain registrar.
