# Security Policy

## Supported Versions

The following versions of VanillaPDF are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Privacy-First Guarantee

VanillaPDF is designed with a "privacy-first" architecture. All PDF processing (merging, splitting, converting, compressing) is performed **locally in your browser**. 

- **No Server Uploads:** Your files are never uploaded to any server.
- **Local State:** All operations use the browser's memory and client-side APIs (`pdf-lib`, `pdfjs-dist`).
- **Data Persistence:** No user data or document content is stored permanently by the application.

## Reporting a Vulnerability

We take the security of VanillaPDF seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please follow these steps:
1. Send an email to [security@example.com](mailto:security@example.com) (Placeholder - Replace with your security contact email).
2. Include a detailed description of the vulnerability.
3. Provide steps to reproduce the issue (PoC).
4. Mention the browser and environment where the issue was found.

We will acknowledge your report within 48 hours and provide a timeline for a fix if necessary.

## Responsible Disclosure Policy

- Give us a reasonable amount of time to fix the issue before making any information public.
- Avoid violating privacy, destroying data, or interrupting our services.
- We do not currently offer a bug bounty program, but we greatly appreciate your help in keeping our users safe.

## Third-Party Libraries

VanillaPDF relies on several third-party libraries (e.g., `next`, `react`, `pdf-lib`). We monitor these dependencies for known vulnerabilities and update them regularly. You can check the current dependencies in `package.json`.
