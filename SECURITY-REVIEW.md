# Security Review

**Assessment date:** 2026-10-19
**Scope:** `Judiciary-of-South-Sudan/Legal-Archive-UI` and the related upload/file paths in `Judiciary-of-South-Sudan/Legal-Archive-API`
**Procedure:** `Legal-Archive-API/.github/modernize/assessment/engines/security/security-assessment-plan.md`

## Executive summary

The assessment completed 59 CWE checklist rules: 4 were marked found and 55 not found. The four found classifications represent two underlying code issues: file path traversal (CWE-22, CWE-23, CWE-99) and unsafe HTML upload acceptance (CWE-434).

The initial npm advisory scan identified 48 CVE matches in Axios 1.11.0, PostCSS 8.4.47, and Vite 5.4.10: 15 high, 30 medium, and 3 low. Those packages were upgraded, along with related toolchain dependencies. The final advisory scan reported no known CVEs for Axios 1.20.0, PostCSS 8.5.23, Vite 6.4.3, and React Router DOM 7.18.4; `npm audit` reported zero vulnerabilities in the resolved dependency tree.

The API's Maven assessment also found 31 advisory records in the first persisted full dependency scan (30 CVEs and one GHSA), plus four Spring Boot 3.4.1 findings from an earlier scan whose identifiers were not retained. The recorded findings in Log4j, Tomcat, Spring Framework, Jackson, Commons Lang, and Netty were remediated. A full scan of 161 resolved runtime dependencies after the Spring Boot 4 migration identified seven remaining Jackson advisories in each of the Jackson 2 and 3 lines; both lines were upgraded and the final scan found no known CVEs. The API's detailed CVE/version table and scan history are in the [API Maven CVE fix summary](https://github.com/Judiciary-of-South-Sudan/Legal-Archive-API/blob/security/file-upload-hardening/.github/modernize/assessment/engines/security/cve-fix-summary.md).

The UI remediation and API dependency/upload changes are committed to their respective security PR branches; neither PR changes a default branch.

## Code findings

| Severity | CWE | Finding | Remediation |
|---|---|---|---|
| High | CWE-22, CWE-23, CWE-99 | Public file operations accepted paths without ensuring that their normalized destination stayed under the upload root, allowing traversal outside the intended directory. | `Legal-Archive-API/src/main/java/com/legalarchive/service/FileStorageService.java` normalizes and resolves paths and rejects destinations outside the upload root. Category names are validated; file controllers return HTTP 400 for rejected paths. |
| Medium | CWE-434 | The upload allowlist accepted `text/html`, permitting active HTML content to be stored and served. PDF content could also be identified by its declared MIME type alone. | Uploads are restricted to matching PDF/DOC/DOCX/text types with format checks; HTML is rejected. PDFs are signature-checked before being served inline, while other files are attachments with `nosniff`. Regression coverage is in `Legal-Archive-API/src/test/java/com/legalarchive/service/FileStorageServiceTest.java`. |

## Dependency findings

The following CVEs were reported against the original direct dependency versions. IDs are grouped by scanner-reported severity.

| Original package | Initial version | Remediated version | Severity | Count | Advisory IDs |
|---|---:|---:|---|---:|---|
| Axios | 1.11.0 | 1.20.0 | High | 12 | CVE-2025-58754, CVE-2026-25639, CVE-2026-42264, CVE-2026-42043, CVE-2026-42035, CVE-2026-42033, CVE-2026-44494, CVE-2026-44495, CVE-2026-44486, CVE-2026-44487, CVE-2026-44488, CVE-2026-44496 |
| Axios | 1.11.0 | 1.20.0 | Medium | 19 | CVE-2025-62718, CVE-2026-40175, CVE-2026-42044, CVE-2026-42041, CVE-2026-42042, CVE-2026-42036, CVE-2026-42034, CVE-2026-42039, CVE-2026-42038, CVE-2026-42037, CVE-2026-44490, CVE-2026-67312, CVE-2026-67313, CVE-2026-67316, CVE-2026-67317, CVE-2026-67319, CVE-2026-101902, CVE-2026-101908, CVE-2026-101904 |
| Axios | 1.11.0 | 1.20.0 | Low | 1 | CVE-2026-42040 |
| PostCSS | 8.4.47 | 8.5.23 | High | 2 | CVE-2026-45623, CVE-2026-73646 |
| PostCSS | 8.4.47 | 8.5.23 | Medium | 2 | CVE-2026-41305, CVE-2026-69153 |
| Vite | 5.4.10 | 6.4.3 | High | 1 | CVE-2026-53571 |
| Vite | 5.4.10 | 6.4.3 | Medium | 9 | CVE-2025-24010, CVE-2025-30208, CVE-2025-31125, CVE-2025-31486, CVE-2025-32395, CVE-2025-46565, CVE-2025-62522, CVE-2026-39365, CVE-2026-53632 |
| Vite | 5.4.10 | 6.4.3 | Low | 2 | CVE-2025-58752, CVE-2025-58751 |

Additional dependency changes included React Router DOM 6 to 7.18.4, Tailwind CSS 3 to 4.3.3, the Tailwind v4 PostCSS plugin, and `@vitejs/plugin-react-swc` 3.11.0. Unused `@tailwindcss/typography` and the development-only `lovable-tagger` were removed. Compatible transitive dependencies were updated with `npm audit fix`.

### API Maven dependency findings

The first persisted Maven scan found 31 advisory records across the resolved graph. Subsequent scans identified three critical Tomcat advisories, two critical Spring Framework advisories, and a critical Netty SNI-routing advisory, along with high- and medium-severity findings in Log4j, Jackson, Commons Lang, and Netty. Spring Boot 4.1.1 manages Spring Framework 7.0.9; Tomcat was set to 11.0.25, Log4j to 2.25.5, Commons Lang to 3.20.0, Netty to 4.2.17.Final, Jackson 2 to 2.21.7, and Jackson 3 to 3.1.7. The migration required moving the MVC starter to `spring-boot-starter-webmvc` and updating Springdoc, Sentry, and Spring Security integration APIs. The [API Maven CVE fix summary](https://github.com/Judiciary-of-South-Sudan/Legal-Archive-API/blob/security/file-upload-hardening/.github/modernize/assessment/engines/security/cve-fix-summary.md) contains every advisory ID retained by the scanner, the recommended versions, and the numbered reports.

## Validation and limitations

- `npm run build` in the UI repository: passed.
- Focused ESLint for the modified Vite and Tailwind configuration: passed.
- `npm audit --audit-level=low`: zero vulnerabilities.
- Final CVE scan of the four patched direct dependencies: no known CVEs found.
- API `mvnw.cmd -B clean verify` on Java 17: build passed; the repository Maven config skips tests by default.
- API `FileStorageServiceTest`: 10 security regression tests passed after a clean compile. The full suite, when explicitly enabled with CORS/JWT test properties, reports 19 tests with 8 errors: seven context errors from a missing `JavaMailSender` bean and unavailable local MongoDB, plus one `LawServiceTest.updateLaw_persistsEveryOptionalField` error (`Law not found with id: law-1`).
- Full UI `npm run lint`: not clean; the latest PR CI reports 38 errors and 22 warnings across the project. This was not expanded into unrelated lint cleanup.

The npm CVE scan and `npm audit` are dependency checks, not a guarantee against undiscovered vulnerabilities. The final CVE scan covered the listed direct packages; the full resolved dependency tree was checked separately by `npm audit`.
