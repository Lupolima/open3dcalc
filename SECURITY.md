# Open3DCalc Security Policy

## Reporting Vulnerabilities

We value the security of Open3DCalc. If you find a security vulnerability:

1. **Do not open a public issue** — report via email or private channel
2. Send an email to **ils15@github.com** with:
   - Clear description of the problem
   - Steps to reproduce
   - Estimated impact
   - Suggested fix (if any)

## Response Process

- ✅ Acknowledgment within **48h**
- 🔄 Updates every **7 days** until resolution
- 🏆 Public credit to the reporter after fix (if desired)
- 📦 Patch release within **14 days** for critical vulnerabilities

## Scope

This project is a **React front-end application** that runs 100% in the browser. There is no backend, database, or custom server. Potential vulnerabilities include:

- XSS (Cross-Site Scripting)
- localStorage data leakage
- dependencies with known CVEs

## Best Practices

- Always use the latest version of Open3DCalc
- Keep your browser updated
- Review permissions if using the installed PWA version
