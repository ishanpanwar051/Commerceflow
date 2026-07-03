# Security

## Measures

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **JWT**: Short-lived access tokens (15 min), refresh token rotation
3. **Rate Limiting**: 100 req/window per IP (configurable)
4. **Helmet**: Security headers (XSS, clickjacking, MIME sniffing)
5. **CORS**: Whitelist origins in production
6. **Input Validation**: Zod schemas on all endpoints
7. **SQL Injection**: Prevented by Prisma parameterized queries
8. **Stripe Webhooks**: Signature verification
9. **Secrets**: Environment variables, never hardcoded
10. **Audit Logs**: Track all admin actions
