# ConfigHub - Deployment Guide

## 🎯 Deployment Options

1. **Docker Compose** - Desenvolvimento e produção simples
2. **Kubernetes** - Produção enterprise com alta disponibilidade
3. **Cloud Managed** - AWS, GCP, Azure
4. **Bare Metal** - Servidores dedicados

---

## 🐳 Docker Compose (Recomendado para Início)

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: confighub-db
    environment:
      POSTGRES_DB: confighub
      POSTGRES_USER: confighub
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - confighub-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U confighub"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: confighub-backend
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=confighub
      - DB_USER=confighub
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - MASTER_KEY=${MASTER_KEY}
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - confighub-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build: ./frontend
    container_name: confighub-frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - confighub-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: confighub-nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend
    networks:
      - confighub-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  confighub-network:
    driver: bridge
```

### .env (Exemplo)

```bash
# Database
DB_PASSWORD=strong_password_change_me

# Security
JWT_SECRET=your_jwt_secret_minimum_256_bits_change_in_production
MASTER_KEY=your_master_encryption_key_32_bytes_minimum

# Optional: Redis for caching
REDIS_HOST=redis
REDIS_PORT=6379
```

### nginx/nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=web:10m rate=1000r/m;

    server {
        listen 80;
        server_name confighub.yourcompany.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name confighub.yourcompany.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API backend
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check
        location /actuator/health {
            proxy_pass http://backend;
            access_log off;
        }

        # Frontend
        location / {
            limit_req zone=web burst=50 nodelay;

            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support for Next.js hot reload
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

### Comandos

```bash
# Iniciar
docker-compose up -d

# Logs
docker-compose logs -f

# Parar
docker-compose down

# Rebuild
docker-compose up -d --build

# Backup do banco
docker exec confighub-db pg_dump -U confighub confighub > backup.sql
```

---

## ☸️ Kubernetes Deployment

### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: confighub
```

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: confighub-config
  namespace: confighub
data:
  application.yml: |
    spring:
      profiles:
        active: production
      datasource:
        url: jdbc:postgresql://postgres-service:5432/confighub
```

### Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: confighub-secrets
  namespace: confighub
type: Opaque
stringData:
  DB_PASSWORD: "change_me"
  JWT_SECRET: "change_me_256_bits"
  MASTER_KEY: "change_me_32_bytes"
```

### PostgreSQL StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: confighub
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: confighub
        - name: POSTGRES_USER
          value: confighub
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: confighub-secrets
              key: DB_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: confighub
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

### Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: confighub-backend
  namespace: confighub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: confighub-backend
  template:
    metadata:
      labels:
        app: confighub-backend
    spec:
      containers:
      - name: backend
        image: confighub/backend:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "production"
        - name: DB_HOST
          value: "postgres-service"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: confighub-secrets
              key: DB_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: confighub-secrets
              key: JWT_SECRET
        - name: MASTER_KEY
          valueFrom:
            secretKeyRef:
              name: confighub-secrets
              key: MASTER_KEY
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: confighub
spec:
  selector:
    app: confighub-backend
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

### Frontend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: confighub-frontend
  namespace: confighub
spec:
  replicas: 2
  selector:
    matchLabels:
      app: confighub-frontend
  template:
    metadata:
      labels:
        app: confighub-frontend
    spec:
      containers:
      - name: frontend
        image: confighub/frontend:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://backend-service:8080"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: confighub
spec:
  selector:
    app: confighub-frontend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: confighub-ingress
  namespace: confighub
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - confighub.yourcompany.com
    secretName: confighub-tls
  rules:
  - host: confighub.yourcompany.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

### HorizontalPodAutoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: confighub
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: confighub-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Deploy no Kubernetes

```bash
# Criar namespace
kubectl apply -f k8s/namespace.yaml

# Criar secrets (usar valores reais)
kubectl apply -f k8s/secrets.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres.yaml

# Aguardar PostgreSQL ficar pronto
kubectl wait --for=condition=ready pod -l app=postgres -n confighub --timeout=300s

# Deploy backend
kubectl apply -f k8s/backend.yaml

# Deploy frontend
kubectl apply -f k8s/frontend.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Verificar
kubectl get all -n confighub

# Logs
kubectl logs -f deployment/confighub-backend -n confighub
```

---

## ☁️ AWS Deployment

### Opção 1: ECS Fargate

```bash
# Criar cluster
aws ecs create-cluster --cluster-name confighub

# Criar task definitions
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Criar serviço
aws ecs create-service \
  --cluster confighub \
  --service-name confighub-backend \
  --task-definition confighub-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

### Opção 2: EKS

```bash
# Criar cluster EKS
eksctl create cluster \
  --name confighub \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 4

# Deploy usando kubectl
kubectl apply -f k8s/
```

### RDS PostgreSQL

```bash
# Criar RDS instance
aws rds create-db-instance \
  --db-instance-identifier confighub-db \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 15.4 \
  --master-username confighub \
  --master-user-password "strong_password" \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --multi-az
```

---

## 🔒 Security Best Practices

### 1. Secrets Management

```bash
# Usar AWS Secrets Manager
aws secretsmanager create-secret \
  --name confighub/master-key \
  --secret-string "your-master-key"

# Ou HashiCorp Vault
vault kv put secret/confighub master_key="..." jwt_secret="..."
```

### 2. Network Security

```yaml
# NetworkPolicy (Kubernetes)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: confighub-netpol
  namespace: confighub
spec:
  podSelector:
    matchLabels:
      app: confighub-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### 3. SSL/TLS

```bash
# Cert-manager (Kubernetes)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# ClusterIssuer
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourcompany.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

---

## 📊 Monitoring & Observability

### Prometheus + Grafana

```yaml
# ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: confighub-backend
  namespace: confighub
spec:
  selector:
    matchLabels:
      app: confighub-backend
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 30s
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "ConfigHub Metrics",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 🔄 Backup & Disaster Recovery

### Backup automático (PostgreSQL)

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="confighub"

# Dump do banco
docker exec confighub-db pg_dump -U confighub $DB_NAME | gzip > $BACKUP_DIR/confighub_$DATE.sql.gz

# Upload para S3
aws s3 cp $BACKUP_DIR/confighub_$DATE.sql.gz s3://confighub-backups/

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "confighub_*.sql.gz" -mtime +30 -delete
```

### Crontab

```bash
# Backup diário às 2am
0 2 * * * /usr/local/bin/backup.sh
```

---

## 🎯 Performance Tuning

### PostgreSQL

```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### JVM (Backend)

```bash
JAVA_OPTS="-Xms512m -Xmx1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

**Fim do guia de deployment**
