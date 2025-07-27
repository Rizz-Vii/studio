#!/bin/bash

# RankPilot Firebase Functions Performance Monitoring Setup
# This script configures advanced monitoring and alerting for production functions

set -e

echo "🚀 Setting up RankPilot Firebase Functions Performance Monitoring..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud CLI is available
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is required but not installed. Please install it first."
    exit 1
fi

# Get project ID
PROJECT_ID=$(firebase use --only-default 2>/dev/null | head -n1 || echo "rankpilot-h3jpc")
print_status "Using Firebase project: $PROJECT_ID"

# 1. Create Custom Metrics for NeuroSEO Performance
print_status "Creating custom metrics for performance tracking..."

# Performance Dashboard Metrics
gcloud logging metrics create performance_dashboard_requests \
    --project=$PROJECT_ID \
    --description="Count of Performance Dashboard function requests" \
    --log-filter='resource.type="cloud_function" 
    resource.labels.function_name="performanceDashboard"
    severity>=DEFAULT' \
    --verbosity=warning || true

gcloud logging metrics create performance_dashboard_errors \
    --project=$PROJECT_ID \
    --description="Count of Performance Dashboard function errors" \
    --log-filter='resource.type="cloud_function"
    resource.labels.function_name="performanceDashboard"
    severity>=ERROR' \
    --verbosity=warning || true

# Real-time Metrics Function
gcloud logging metrics create realtime_metrics_requests \
    --project=$PROJECT_ID \
    --description="Count of Real-time Metrics function requests" \
    --log-filter='resource.type="cloud_function"
    resource.labels.function_name="realtimeMetrics"
    severity>=DEFAULT' \
    --verbosity=warning || true

# Function Metrics Function
gcloud logging metrics create function_metrics_requests \
    --project=$PROJECT_ID \
    --description="Count of Function Metrics requests" \
    --log-filter='resource.type="cloud_function"
    resource.labels.function_name="functionMetrics"
    severity>=DEFAULT' \
    --verbosity=warning || true

print_success "Custom metrics created successfully!"

# 2. Create Dashboards
print_status "Creating performance monitoring dashboards..."

cat > /tmp/performance-dashboard.json << EOF
{
  "displayName": "RankPilot Firebase Functions Performance",
  "mosaicLayout": {
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Function Execution Count",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "metric.type=\"cloudfunctions.googleapis.com/function/execution_count\" resource.type=\"cloud_function\"",
                    "aggregation": {
                      "alignmentPeriod": "60s",
                      "perSeriesAligner": "ALIGN_RATE",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": ["resource.label.function_name"]
                    }
                  }
                },
                "plotType": "LINE"
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "Executions/min",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "width": 6,
        "height": 4,
        "xPos": 6,
        "widget": {
          "title": "Function Execution Times (95th percentile)",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "metric.type=\"cloudfunctions.googleapis.com/function/execution_times\" resource.type=\"cloud_function\"",
                    "aggregation": {
                      "alignmentPeriod": "300s",
                      "perSeriesAligner": "ALIGN_DELTA",
                      "crossSeriesReducer": "REDUCE_PERCENTILE_95",
                      "groupByFields": ["resource.label.function_name"]
                    }
                  }
                },
                "plotType": "LINE"
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "Milliseconds",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "width": 6,
        "height": 4,
        "yPos": 4,
        "widget": {
          "title": "Memory Usage",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "metric.type=\"cloudfunctions.googleapis.com/function/user_memory_bytes\" resource.type=\"cloud_function\"",
                    "aggregation": {
                      "alignmentPeriod": "300s",
                      "perSeriesAligner": "ALIGN_MEAN",
                      "crossSeriesReducer": "REDUCE_MEAN",
                      "groupByFields": ["resource.label.function_name"]
                    }
                  }
                },
                "plotType": "LINE"
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "Bytes",
              "scale": "LINEAR"
            }
          }
        }
      },
      {
        "width": 6,
        "height": 4,
        "xPos": 6,
        "yPos": 4,
        "widget": {
          "title": "Error Rate",
          "xyChart": {
            "dataSets": [
              {
                "timeSeriesQuery": {
                  "timeSeriesFilter": {
                    "filter": "metric.type=\"cloudfunctions.googleapis.com/function/execution_count\" resource.type=\"cloud_function\" metric.label.status!=\"ok\"",
                    "aggregation": {
                      "alignmentPeriod": "300s",
                      "perSeriesAligner": "ALIGN_RATE",
                      "crossSeriesReducer": "REDUCE_SUM",
                      "groupByFields": ["resource.label.function_name"]
                    }
                  }
                },
                "plotType": "LINE"
              }
            ],
            "timeshiftDuration": "0s",
            "yAxis": {
              "label": "Errors/min",
              "scale": "LINEAR"
            }
          }
        }
      }
    ]
  }
}
EOF

# Create the dashboard
gcloud monitoring dashboards create --config-from-file=/tmp/performance-dashboard.json \
    --project=$PROJECT_ID --verbosity=warning || true

print_success "Performance dashboard created!"

# 3. Create Alert Policies
print_status "Setting up alerting policies..."

# High Error Rate Alert
cat > /tmp/error-rate-alert.json << EOF
{
  "displayName": "RankPilot Functions - High Error Rate",
  "conditions": [
    {
      "displayName": "Error rate > 5%",
      "conditionThreshold": {
        "filter": "resource.type=\"cloud_function\" metric.type=\"cloudfunctions.googleapis.com/function/execution_count\" metric.label.status!=\"ok\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": 0.05,
        "duration": "300s",
        "aggregations": [
          {
            "alignmentPeriod": "300s",
            "perSeriesAligner": "ALIGN_RATE",
            "crossSeriesReducer": "REDUCE_MEAN",
            "groupByFields": ["resource.label.function_name"]
          }
        ]
      }
    }
  ],
  "combiner": "OR",
  "enabled": true
}
EOF

gcloud alpha monitoring policies create --config-from-file=/tmp/error-rate-alert.json \
    --project=$PROJECT_ID --verbosity=warning || true

# High Latency Alert
cat > /tmp/latency-alert.json << EOF
{
  "displayName": "RankPilot Functions - High Latency",
  "conditions": [
    {
      "displayName": "95th percentile latency > 10s",
      "conditionThreshold": {
        "filter": "resource.type=\"cloud_function\" metric.type=\"cloudfunctions.googleapis.com/function/execution_times\"",
        "comparison": "COMPARISON_GREATER_THAN",
        "thresholdValue": 10000,
        "duration": "300s",
        "aggregations": [
          {
            "alignmentPeriod": "300s",
            "perSeriesAligner": "ALIGN_DELTA",
            "crossSeriesReducer": "REDUCE_PERCENTILE_95",
            "groupByFields": ["resource.label.function_name"]
          }
        ]
      }
    }
  ],
  "combiner": "OR",
  "enabled": true
}
EOF

gcloud alpha monitoring policies create --config-from-file=/tmp/latency-alert.json \
    --project=$PROJECT_ID --verbosity=warning || true

print_success "Alert policies created!"

# 4. Enable enhanced monitoring
print_status "Enabling enhanced function monitoring..."

# Enable Cloud Monitoring API if not already enabled
gcloud services enable monitoring.googleapis.com --project=$PROJECT_ID --verbosity=warning || true
gcloud services enable logging.googleapis.com --project=$PROJECT_ID --verbosity=warning || true

print_success "Enhanced monitoring enabled!"

# 5. Create monitoring queries for common issues
print_status "Setting up log-based monitoring queries..."

# Performance function errors
gcloud logging sinks create performance-function-errors \
    bigquery.googleapis.com/projects/$PROJECT_ID/datasets/function_logs \
    --log-filter='resource.type="cloud_function"
    resource.labels.function_name=~"performance.*|realtime.*|function.*"
    severity>=ERROR' \
    --project=$PROJECT_ID --verbosity=warning || true

print_success "Log-based monitoring configured!"

# Cleanup temp files
rm -f /tmp/performance-dashboard.json /tmp/error-rate-alert.json /tmp/latency-alert.json

print_success "🎉 Performance monitoring setup complete!"
print_status "📊 View your dashboards: https://console.cloud.google.com/monitoring/dashboards?project=$PROJECT_ID"
print_status "🚨 View your alerts: https://console.cloud.google.com/monitoring/alerting?project=$PROJECT_ID"
print_status "📝 View function logs: https://console.cloud.google.com/functions/list?project=$PROJECT_ID"

echo ""
echo "🔧 Next steps:"
echo "1. Configure notification channels in the Google Cloud Console"
echo "2. Set up Slack/email notifications for alerts"
echo "3. Review and adjust alert thresholds based on your requirements"
echo "4. Set up regular performance reviews using the dashboard"
