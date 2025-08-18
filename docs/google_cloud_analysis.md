# Análise do Google Cloud Build e Cloud Run - Descobertas Importantes

## 📋 PERMISSÕES NECESSÁRIAS PARA CLOUD RUN

### Permissões IAM Obrigatórias para Deploy
Para implantar no Cloud Run usando Cloud Build, a conta de serviço precisa dos seguintes papéis:

1. **Desenvolvedor do Cloud Run** (`roles/run.developer`)
2. **Gravador de registros** (`roles/logging.logWriter`) 
3. **Gravador do Artifact Registry** (`roles/artifactregistry.writer`)
4. **Usuário da conta de serviço** (`roles/iam.serviceAccountUser`)
5. **Administrador do Storage** (`roles/storage.admin`)

## 🚨 ERROS COMUNS IDENTIFICADOS

### 1. Erro de Permissão IAM
```
Missing necessary permission iam.serviceAccounts.actAs for [USER] on the service account [SERVICE_ACCOUNT]
```

**Causa**: A conta de serviço de build não tem as permissões de IAM necessárias para implantação no Cloud Run.

### 2. Erro de Gatilho de Build
```
Failed to trigger build: Permission 'cloudbuild.builds.create' denied on resource 'projects/xxxxxxxx'
```

**Causa**: A conta de serviço não tem a permissão `cloudbuild.builds.create`.

**Solução**: Conceder o papel `Cloud Build Service Account` à conta de serviço.

### 3. Erro de Agente de Serviço
```
Caller does not have required permission to use project $PROJECT_ID
```

**Causa**: O agente de serviço do Cloud Build foi excluído ou não tem permissões.

## 📊 ESTRUTURA CORRETA DO CLOUDBUILD.YAML

```yaml
steps:
  # Build the image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE', '.']
  
  # Push the image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE']
  
  # Deploy image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args: ['run', 'deploy', 'SERVICE_NAME', '--image', 'LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE', '--region', 'SERVICE_REGION']

images:
- 'LOCATION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE'
```

## 🔍 PRÓXIMOS PASSOS DE INVESTIGAÇÃO

1. Verificar permissões da conta de serviço do Cloud Build
2. Analisar logs detalhados dos builds que falharam
3. Verificar se o agente de serviço existe e tem permissões corretas
4. Validar estrutura do cloudbuild.yaml do projeto

