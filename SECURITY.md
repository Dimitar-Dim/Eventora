# Security Configuration Guide

## ⚠️ Important: Never commit secrets to version control!

This document outlines how to securely manage credentials for Eventora.

## Environment Variables Setup

### Development Environment

1. **Create a local `.env` file in the root directory:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your local development credentials:**
   ```
   DATABASE_URL=jdbc:postgresql://localhost:5432/eventora
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_local_password
   JWT_SECRET=your_dev_jwt_secret_min_32_chars
   MAIL_USERNAME=dev-email@gmail.com
   MAIL_PASSWORD=your_gmail_app_password
   ```

3. **For Backend (Spring Boot):**
   Create `Backend/Eventora/src/main/resources/application-local.properties`:
   ```properties
   spring.datasource.url=${DATABASE_URL}
   spring.datasource.username=${DATABASE_USERNAME}
   spring.datasource.password=${DATABASE_PASSWORD}
   jwt.secret=${JWT_SECRET}
   spring.mail.username=${MAIL_USERNAME}
   spring.mail.password=${MAIL_PASSWORD}
   ```

   Run with: `./gradlew bootRun --args='--spring.profiles.active=local'`

### Production Deployment

Use one of the following methods:

#### Option 1: Docker Environment Variables
```bash
docker run -e DATABASE_PASSWORD=prod_password \
           -e JWT_SECRET=prod_jwt_secret \
           -e MAIL_PASSWORD=prod_mail_password \
           eventora-backend:latest
```

#### Option 2: Docker Compose .env file
Create `.env.production`:
```
DATABASE_PASSWORD=prod_secure_password
JWT_SECRET=prod_jwt_secret_32_chars_min
MAIL_PASSWORD=prod_app_specific_password
```

Then run:
```bash
docker-compose --env-file .env.production up -d
```

#### Option 3: Cloud Secrets (AWS, Azure, GCP)
- Use AWS Secrets Manager / Parameter Store
- Use Azure Key Vault
- Use Google Secret Manager
- Use environment variables provided by your hosting platform

## Generating Secure Values

### JWT Secret (minimum 32 characters, base64 encoded)

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Node.js:**
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('base64'));
```

### Database Password
```bash
openssl rand -base64 16
```

## Gmail App-Specific Passwords

If using Gmail for email notifications:

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password (16 characters with spaces)
4. Never share this password

## Security Checklist

Before making repository public:

- [ ] Remove all hardcoded credentials from `application.properties`
- [ ] Check all property files for exposed secrets
- [ ] Verify `.gitignore` includes `application-local.*` and `.env*`
- [ ] Run `git log` to check if secrets were ever committed
- [ ] If secrets were committed, use `git-filter-branch` or `BFG Repo-Cleaner` to remove them
- [ ] Rotate all exposed credentials immediately
- [ ] Never store secrets in code comments or documentation

## Rotation Secrets After Leak

If credentials were exposed:

```bash
# 1. Update credentials in your system
# 2. Force git garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Or use BFG to remove from history (if secrets were committed)
brew install bfg  # macOS
bfg --replace-text passwords.txt .git/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## References

- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Spring Boot Externalized Configuration](https://spring.io/guides/gs/externalized-configuration/)
- [12 Factor App: Config](https://12factor.net/config)
