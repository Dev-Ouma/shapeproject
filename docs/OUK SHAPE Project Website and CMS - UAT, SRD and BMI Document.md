

**OPEN UNIVERSITY OF KENYA**

**SHAPE PROJECT – SMART CITY HIGHER EDUCATION ADVANCEMENT PROGRAM IN EAST AFRICA**

**Project Website & Content Management System (CMS)**

**System Requirements Definition (SRD), User Acceptance Testing (UAT) and Backlog Management Index (BMI) Document**

Version 1.1  
**27th October 2026**

**Contents**

**Revision History	3**

**Introduction	3**

**Scope	4**

**Definitions, Acronyms, and Abbreviations	4**

**System Overview and Technology Stack	7**

**System Requirements Definition (SRD)	8**

**Test Type & Categories	12**

**Functional Test Cases (User & Developer Perspective)	14**

**Group 1: Public Website – Navigation, Pages & Branding (14 Test Cases)	14**

**Group 2: Public Website – News, Categories, Tags, Search & Comments (12 Test Cases)	16**

**Group 3: Public Website – Contact Form & Email Notifications (9 Test Cases)	18**

**Group 4: Public Website – Events Timeline (Gantt) & Executive Brief (9 Test Cases)	19**

**Group 5: SEO & Search Engine Indexing (12 Test Cases)	21**

**Group 6: Website Analytics – Visitor, Click & Search Tracking (14 Test Cases)	23**

**Group 7: CMS Authentication – Sign-in & Two-Step Verification (14 Test Cases)	25**

**Group 8: CMS Session Management – Idle Timeout & Session Control (12 Test Cases)	27**

**Group 9: CMS Content Management – Editors, Validation, Duplicate & Revisions (16 Test Cases)	29**

**Group 10: CMS Media Library & Recycle Bin (11 Test Cases)	32**

**Group 11: CMS Engagement – Inbox & Comment Moderation (11 Test Cases)	34**

**Group 12: Administration – Users, Roles & Invitation Emails (13 Test Cases)	36**

**Group 13: Administration – Audit Trail, Release Notes & System Overview (11 Test Cases)	38**

**Group 14: Administration – Maintenance Mode & Lockdown (13 Test Cases)	40**

**Group 15: CMS Dashboard, Analytics Screen & Responsive Layout (12 Test Cases)	42**

**Group 16: Security, Performance & Deployment (Non-Functional) (16 Test Cases)	44**

**Backlog Management Index	47**

**Tester Approval / Sign-off	49**

# **Revision History**

| No. | Date | Version | Description | Author | Application URL |
| :---: | :---: | :---: | ----- | ----- | ----- |
| **1\.**  | October 2026 | v1.0 | Initial System Requirements Definition, User Acceptance Testing and Backlog Management Index document for the SHAPE Project website and CMS | — | https\://shapeproject.ouk.ac.ke/ (website) and https\://shapeproject.ouk.ac.ke/admin/login (CMS) |
| **2\.** | 27 October 2026 | v1.1 | Final security scan results recorded; server hardening and handover actions closed; ready for sign-off by the Vice-Chancellor and Principal Investigator | — | https\://shapeproject.ouk.ac.ke/ |

# **Introduction**

This document defines the system requirements for, and records the User Acceptance Test (UAT) cases executed against, the SHAPE Project website and its Content Management System (CMS). SHAPE (Smart City Higher Education Advancement Program in East Africa) is an Erasmus+ Capacity Building in Higher Education project co-funded by the European Union and hosted by the Open University of Kenya (OUK).

The system consists of the public project website (home, about, partners, project team, deliverables, materials, events, news, contact, search and the Executive Brief) and the CMS used by OUK staff to manage every piece of content on the website. The CMS includes content editors, a media library, an inbox for contact messages, comment moderation, website analytics, user and invitation management, an audit trail, version history, a recycle bin, release notes, maintenance mode and an emergency lockdown.

The document is organised in three parts: the **System Requirements Definition (SRD)**, which states what the system must do; the **User Acceptance Test cases**, grouped by functional module, each traced to the requirements; and the **Backlog Management Index (BMI)**, which lists the open items, risks and follow-up actions identified during testing and deployment.

# **Scope**

The scope of this UAT covers functional verification of: the public website pages, navigation, branding (OUK colours) and animations; news articles with categories, tags, search and moderated comments; the contact form and its email notifications; the events timeline (Gantt chart) and the downloadable Executive Brief; search engine optimisation and Google Search Console indexing; cookieless website analytics (page views, clicks, downloads, searches, broken links); CMS sign-in with two-step verification (authenticator app), sign-in lockout and session management (60-minute idle timeout, 12-hour limit, session list); content editing, validation, duplicate and version history; the media library and recycle bin; the inbox and comment moderation; users, roles and branded invitation and welcome emails; the audit trail, release notes and system overview; maintenance mode and the emergency lockdown; the CMS dashboard, analytics screen and phone layout.

Group 16 additionally records the non-functional checks carried out before handover: dynamic application security testing (StackHawk HawkScan) of a production build and of the live website, dependency vulnerability audit, security headers, HTTP method restriction, TLS, backups, deployment with automatic rollback and the move of the application to `/var/www/shapeproject` on the server.

All test cases were executed against the production build of release **d2a2a47** — automatically (Vitest unit tests and Playwright end-to-end browser tests, 76 + 28 passing) on a fresh test database, and by manual verification on the live website https\://shapeproject.ouk.ac.ke. Content authoring by project staff (for example writing new news articles) and the server's unrelated services (Matrix, PHP sites, the SOMAS DR relay) are out of scope.

# **Definitions, Acronyms, and Abbreviations**

| Acronym / Term | Full Form / Definition |
| ----- | ----- |
| **OUK** | Open University of Kenya |
| **SHAPE** | Smart City Higher Education Advancement Program in East Africa – the Erasmus+ project the website represents |
| **Erasmus+ CBHE** | Erasmus+ Capacity Building in Higher Education, the European Union programme that co-funds SHAPE |
| **CMS** | Content Management System – the administration area at `/admin` used to manage the website |
| **SRD** | System Requirements Definition |
| **UAT** | User Acceptance Testing |
| **BMI** | Backlog Management Index – the register of open items, risks and follow-up actions |
| **FR / NFR** | Functional Requirement / Non-Functional Requirement |
| **TC** | Test Case |
| **TC\_SH** | Test Case – SHAPE website and CMS |
| **URL** | Uniform Resource Locator |
| **Admin** | CMS role that manages everything, including users, settings, navigation, redirects and the Administration area |
| **Editor** | CMS role that manages website content but not users, settings or the Administration area |
| **Visitor** | A member of the public browsing the website |
| **Two-step verification / OTP / TOTP** | Sign-in second factor: a 6-digit one-time code from an authenticator app (Time-based One-Time Password, RFC 6238), with single-use recovery codes |
| **Session** | A signed-in CMS visit, identified by a random token in a secure cookie |
| **Idle timeout** | Automatic sign-out after 60 minutes without activity |
| **Collection** | A type of website content managed in the CMS (for example hero slides, thematic areas, team members, events, news posts) |
| **Revision** | A saved version of a content item, which can be compared and restored |
| **Recycle bin** | Holding area for deleted content and files; items can be restored for 30 days |
| **Audit trail** | Record of every action taken in the CMS: who, what, when, from which IP address and browser, and what changed |
| **Maintenance mode** | Switch that shows visitors a branded "under maintenance" page while signed-in staff keep working |
| **Lockdown** | Emergency switch that signs everyone else out, revokes invitations, blocks editors and public forms, and can freeze all edits |
| **Executive Brief** | The 12-page project brief that reads online and downloads as a PDF |
| **Gantt chart** | The interactive project timeline on the Events page showing work packages, deliverables and events with real dates |
| **SEO** | Search Engine Optimisation |
| **JSON-LD / Structured data** | Machine-readable page descriptions (schema.org) that help Google show rich results |
| **Sitemap** | The list of public pages (`/sitemap.xml`) submitted to Google Search Console |
| **Analytics (cookieless)** | First-party visit statistics stored without cookies or IP addresses; visitors are counted with a hash that changes every day |
| **DAST** | Dynamic Application Security Testing – scanning the running application for vulnerabilities (StackHawk HawkScan) |
| **CSP** | Content Security Policy – browser rule that blocks injected scripts |
| **HSTS** | HTTP Strict Transport Security – forces browsers to use HTTPS |
| **SMTP** | Simple Mail Transfer Protocol – outgoing email, sent through the Google Workspace relay `smtp-relay.gmail.com:587` |
| **VPS** | Virtual Private Server hosting the website (Ubuntu 22.04 LTS) |
| **Positive Test Case** | A test scenario verifying that the system behaves correctly with valid input and expected user actions |
| **Negative Test Case** | A test scenario verifying that the system correctly handles invalid input, missing information, unauthorised access or error conditions |
| **Pass** | Indicates that a test case executed successfully and met the expected outcome |
| **Fail** | Indicates that a test case did not meet the expected outcome during execution |
| **Pending** | Indicates that the test case could not yet be fully executed (for example it depends on an external party) |
| **Conditional** | Group status assigned where one or more test cases are Failed or Pending, so the group cannot yet be reported as Passed |
| **Sign-off** | Formal acceptance of the system after successful completion of User Acceptance Testing |

# **System Overview and Technology Stack**

| Layer | Technology |
| ----- | ----- |
| **Language / Runtime** | TypeScript on Node.js 24 LTS (24.22.1 in production) |
| **Framework** | Astro 7, server-rendered (SSR), with the @astrojs/node 11 standalone adapter |
| **Frontend** | Semantic HTML from Astro components, CSS with design tokens, small vanilla TypeScript modules (no client framework) |
| **Backend** | Astro pages, API routes and middleware (routing, security headers, sign-in, roles, maintenance, lockdown) |
| **Database** | SQLite 3.53 through Node's built-in `node:sqlite` (WAL journal, versioned migrations, six schema versions) |
| **CMS** | Custom, schema-driven editors; TipTap 3 rich text; sanitize-html |
| **Authentication** | scrypt password hashing, hashed session tokens, TOTP two-step verification with recovery codes, invitation links |
| **Media / PDF / Email** | sharp 0.35 with ImageMagick fallback; Playwright + Chromium for the Executive Brief PDF; Nodemailer 10 over the Google Workspace SMTP relay |
| **Analytics** | First-party cookieless beacon and SQL reports; hand-built SVG charts with smooth (monotone cubic) curves |
| **UI / UX** | OUK palette (teal #037b90, coral #ff7f50, white), Poppins and Inter fonts, Lucide icons, responsive from 390 px phones to desktop |
| **Motion** | CSS transitions/keyframes and IntersectionObserver: word-by-word headings, scroll reveals, count-up numbers, hero zoom, page progress bar, first-visit loader; disabled for reduced-motion users |
| **Hosting** | Ubuntu 22.04 VPS, Nginx reverse proxy, Let's Encrypt TLS, systemd service, application in `/var/www/shapeproject` |
| **Quality & Security** | Vitest (unit), Playwright (end-to-end), StackHawk HawkScan (DAST), npm audit |

# **System Requirements Definition (SRD)**

## **Functional Requirements**

| Req. ID | Requirement | Priority | Verified by |
| :---: | ----- | :---: | :---: |
| **FR-01** | The website shall present the SHAPE project through Home, About, Partners, Project Team, Deliverables, Materials, Events, News, Contact and Executive Brief pages, in OUK colours with the EU co-funding acknowledgement. | Must | Group 1 |
| **FR-02** | The website shall publish news articles with categories, tags, images, reading time, an RSS feed and visitor comments that appear only after moderation. | Must | Group 2 |
| **FR-03** | Visitors shall be able to search the site from any page and on a results page. | Must | Group 2 |
| **FR-04** | Visitors shall be able to send a message through the contact form; the message shall be stored in the CMS and notified by email. | Must | Group 3 |
| **FR-05** | The Events page shall show an interactive timeline (Gantt) with real start/end dates, deliverable deadlines and events. | Should | Group 4 |
| **FR-06** | The Executive Brief shall read online and download as a PDF that staff can regenerate from the CMS. | Should | Group 4 |
| **FR-07** | Every public page shall carry unique titles and descriptions, canonical URLs, social sharing tags and structured data; the site shall publish `robots.txt` and an XML sitemap and be verified in Google Search Console. | Must | Group 5 |
| **FR-08** | The system shall record page views, engaged time, scroll depth, clicks, downloads, outbound and contact links, searches and broken links without cookies or stored IP addresses, and report them in the CMS with charts and CSV export. | Must | Group 6 |
| **FR-09** | CMS access shall require email and password plus a one-time code from an authenticator app, with recovery codes and lockout after repeated failures. | Must | Group 7 |
| **FR-10** | CMS sessions shall end after 60 minutes without activity (with a warning and "Stay signed in"), after 12 hours in any case, and when the user's password, role or access changes; users shall see and end their own sessions. | Must | Group 8 |
| **FR-11** | Staff shall be able to create, edit, reorder, publish, schedule, duplicate and delete every type of website content, with validation, previews and version history (compare and restore). | Must | Group 9 |
| **FR-12** | Staff shall be able to upload images and documents to a media library; deleted content and files shall go to a recycle bin with 30-day retention and restore. | Must | Group 10 |
| **FR-13** | Staff shall manage contact messages in an inbox (folders, search, star, archive, replies recorded and emailed) and approve or reject visitor comments. | Must | Group 11 |
| **FR-14** | Admins shall invite users by email with a branded, single-use, 7-day invitation and assign roles (admin, editor); a branded welcome email shall be sent when the account is created. | Must | Group 12 |
| **FR-15** | The system shall keep an audit trail of all CMS actions with filters, field-level changes, IP address, browser and CSV export; admins shall publish release notes. | Must | Group 13 |
| **FR-16** | Admins shall be able to switch on maintenance mode and an emergency lockdown, with clear banners and one-click recovery. | Must | Group 14 |
| **FR-17** | The CMS shall provide a dashboard with key figures and charts and shall be usable on phones (collapsible sidebar/drawer). | Should | Group 15 |

## **Non-Functional Requirements**

| Req. ID | Requirement | Priority | Verified by |
| :---: | ----- | :---: | :---: |
| **NFR-01 Security** | The application shall resist the OWASP Top 10 (injection, XSS, CSRF, broken authentication, misconfiguration) and pass a DAST scan with no unresolved High findings. | Must | Group 16 |
| **NFR-02 Security headers** | Responses shall carry CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy; only GET, HEAD and POST shall be accepted. | Must | Group 16 |
| **NFR-03 Dependencies** | All third-party libraries and the runtime shall be on current, supported releases with no known vulnerabilities at handover. | Must | Group 16 |
| **NFR-04 Privacy** | Analytics shall not use cookies or store IP addresses; personal data shall be limited to staff accounts and messages people send. | Must | Groups 6, 16 |
| **NFR-05 Availability** | The site shall run as a supervised service that restarts on failure and at boot; deployments shall roll back automatically if the new release fails its health check. | Must | Group 16 |
| **NFR-06 Recoverability** | The database and uploads shall be backed up nightly (30-day retention) and before every deployment. | Must | Group 16 |
| **NFR-07 Usability & Accessibility** | Pages shall work from 390 px phones to desktops without horizontal scrolling, with labelled controls, keyboard access and reduced-motion support. | Should | Groups 1, 15 |
| **NFR-08 Maintainability** | Content types shall be defined in one schema file; database changes shall be versioned migrations; the system shall be documented in the README. | Should | Group 16 |

# **Test Type & Categories**

**Test Type: Manual Test and Automated Test (Vitest unit tests, Playwright end-to-end browser tests)**  
**Total Test Cases Executed: 199**

| Group | Functional Module | Total Test Cases | UAT Status |
| :---: | ----- | :---: | :---: |
| **Group 1** | Public Website – Navigation, Pages & Branding | 14 | **Passed** |
| **Group 2** | Public Website – News, Categories, Tags, Search & Comments | 12 | **Passed** |
| **Group 3** | Public Website – Contact Form & Email Notifications | 9 | **Passed** |
| **Group 4** | Public Website – Events Timeline (Gantt) & Executive Brief | 9 | **Passed** |
| **Group 5** | SEO & Search Engine Indexing | 12 | **Conditional** |
| **Group 6** | Website Analytics – Visitor, Click & Search Tracking | 14 | **Passed** |
| **Group 7** | CMS Authentication – Sign-in & Two-Step Verification | 14 | **Passed** |
| **Group 8** | CMS Session Management – Idle Timeout & Session Control | 12 | **Passed** |
| **Group 9** | CMS Content Management – Editors, Validation, Duplicate & Revisions | 16 | **Passed** |
| **Group 10** | CMS Media Library & Recycle Bin | 11 | **Passed** |
| **Group 11** | CMS Engagement – Inbox & Comment Moderation | 11 | **Passed** |
| **Group 12** | Administration – Users, Roles & Invitation Emails | 13 | **Passed** |
| **Group 13** | Administration – Audit Trail, Release Notes & System Overview | 11 | **Passed** |
| **Group 14** | Administration – Maintenance Mode & Lockdown | 13 | **Passed** |
| **Group 15** | CMS Dashboard, Analytics Screen & Responsive Layout | 12 | **Passed** |
| **Group 16** | Security, Performance & Deployment (Non-Functional) | 16 | **Passed** |

**Execution Summary**

| Metric | Count | Percentage |
| ----- | :---: | :---: |
| Total Test Cases | 199 | 100% |
| Passed | 197 | 99.0% |
| Failed | 0 | 0.0% |
| Pending (awaiting an external party) | 2 | 1.0% |

# **Functional Test Cases (User & Developer Perspective)**

## **Group 1: Public Website – Navigation, Pages & Branding (14 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_001** \[Positive\] | Visitor / Home | Visitor opens https\://shapeproject.ouk.ac.ke/. | Home page loads with top bar (phone +254 722 214306, email shape@ouk.ac.ke, social links), SHAPE and EU logos, menu, hero slider and project sections. | Page loads (HTTP 200) with all sections. | **Pass** |
| **TC\_SH\_002** \[Positive\] | Visitor / Hero slider | Visitor waits on the home page and uses the slider arrows and dots. | Slides rotate, including the OUK campus slide "Bringing Smart City Education to Every Learner"; arrows and dots change slides. | Slider rotates and responds to arrows and dots. | **Pass** |
| **TC\_SH\_003** \[Positive\] | Visitor / Menu | Visitor opens About, Partners, Project Team, Deliverables, Materials, Events, Executive Brief, News and Contact from the menu. | Each page loads with no browser errors. | All 14 public routes return 200 with no script errors (automated). | **Pass** |
| **TC\_SH\_004** \[Positive\] | Visitor / About | Visitor hovers over the Thematic Areas cards. | Cards animate on hover as on the original design. | Hover animation present. | **Pass** |
| **TC\_SH\_005** \[Positive\] | Visitor / Project Team | Visitor opens Project Team. | Coordinators and team members show with photos, roles and institutions. | Team displayed with avatars. | **Pass** |
| **TC\_SH\_006** \[Positive\] | Visitor / Materials | Visitor opens Materials and clicks a published deliverable document. | Brand assets, documents and gallery are listed; the document downloads. | Published deliverable downloadable (automated). | **Pass** |
| **TC\_SH\_007** \[Positive\] | Visitor / Branding | Visitor views any page. | Teal #037b90 and coral #ff7f50 OUK colours are used; footer shows the EU disclaimer and "Hosted by" OUK credit. | Colours and credits correct. | **Pass** |
| **TC\_SH\_008** \[Positive\] | Visitor / Motion | Visitor scrolls down the home page. | Headings appear word by word, cards slide in, numbers count up; a progress bar runs on page changes; a short loader shows on the first visit. | Animations run as specified. | **Pass** |
| **TC\_SH\_009** \[Positive\] | Visitor / Motion – accessibility | Visitor with "reduce motion" enabled in the operating system opens the site. | Animations are switched off; content is shown immediately. | Reduced-motion rules applied. | **Pass** |
| **TC\_SH\_010** \[Positive\] | Visitor / Phone layout | Visitor opens the site on a phone (390 px wide) and opens the menu. | No sideways scrolling; menu opens with the About submenu. | No horizontal overflow on 7 pages; menu works (checked at iPhone 13 size). | **Pass** |
| **TC\_SH\_011** \[Negative\] | Visitor / 404 | Visitor opens a page that does not exist, e.g. /does-not-exist/. | Branded "page can't be found" page with HTTP 404. | 404 page returned (automated). | **Pass** |
| **TC\_SH\_012** \[Positive\] | Visitor / Redirects | Visitor opens an old address configured as a redirect in the CMS. | Visitor is sent (301) to the new page. | Managed redirect works (automated). | **Pass** |
| **TC\_SH\_013** \[Positive\] | Admin / Site settings | Admin changes the contact phone and email in Site settings and saves. | New details appear in the top bar, footer and contact page across the site. | Contact details updated site-wide (automated). | **Pass** |
| **TC\_SH\_014** \[Positive\] | Visitor / Social links | Visitor clicks the social icons. | Facebook, X, LinkedIn, YouTube and Instagram open the SHAPE accounts. | Links open correct accounts. | **Pass** |

## **Group 2: Public Website – News, Categories, Tags, Search & Comments (12 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_015** \[Positive\] | Visitor / News | Visitor opens News. | Published articles are listed newest first with image, date and excerpt. | News list displayed. | **Pass** |
| **TC\_SH\_016** \[Positive\] | Visitor / News article | Visitor opens an article. | Full article with images, reading time, categories, tags and comment form. | Article page complete. | **Pass** |
| **TC\_SH\_017** \[Positive\] | Visitor / Category & tag | Visitor clicks a category and a tag. | Archive pages list matching articles. | /category/news/ and /tag/kenya/ load (automated). | **Pass** |
| **TC\_SH\_018** \[Positive\] | Visitor / Search modal | Visitor clicks the search icon and types "mombasa". | Matching pages appear as the visitor types. | Live results filter correctly. | **Pass** |
| **TC\_SH\_019** \[Positive\] | Visitor / Search results | Visitor submits a search. | /search/?s=… lists matching pages and articles. | Results page loads (automated). | **Pass** |
| **TC\_SH\_020** \[Negative\] | Visitor / Search results | Visitor searches for a term with no matches. | Message "It seems we can't find what you're looking for." | Empty-result message shown. | **Pass** |
| **TC\_SH\_021** \[Positive\] | Visitor / Comments | Visitor submits a comment with name, email and text. | Message that the comment awaits moderation; comment not yet visible. | Comment held for moderation (automated). | **Pass** |
| **TC\_SH\_022** \[Positive\] | Admin / Comments | Admin approves the comment. | Comment appears under the article. | Approved comment visible (automated). | **Pass** |
| **TC\_SH\_023** \[Negative\] | Visitor / Comments | Visitor submits a comment with a missing name or invalid email. | Comment rejected with an error. | Invalid comments rejected (unit test). | **Pass** |
| **TC\_SH\_024** \[Negative\] | Visitor / Comments – abuse | Visitor submits comments containing HTML/script. | Markup stripped; text stored and shown literally, never executed. | Markup stripped, characters preserved (unit test). | **Pass** |
| **TC\_SH\_025** \[Positive\] | Editor / News post | Editor creates a draft post, previews it, publishes it, then deletes it. | Draft not public; preview visible to staff only; published post public; deleted post removed. | Full lifecycle verified (automated). | **Pass** |
| **TC\_SH\_026** \[Positive\] | Visitor / RSS feed | Visitor opens /feed.xml. | Valid RSS feed of published news. | Feed served. | **Pass** |

## **Group 3: Public Website – Contact Form & Email Notifications (9 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_027** \[Positive\] | Visitor / Contact | Visitor fills in name, email, subject and message and clicks Send. | Message "your message has been sent". | Confirmation shown (automated). | **Pass** |
| **TC\_SH\_028** \[Positive\] | Admin / Inbox | Admin opens Inbox after TC\_SH\_027. | The message appears unread in the Inbox with an unread badge in the sidebar. | Message received in Inbox (automated). | **Pass** |
| **TC\_SH\_029** \[Positive\] | System / Email notification | System action after a contact message. | Notification email sent to shape@ouk.ac.ke from "SHAPE Project \<shape@ouk.ac.ke\>". | Relay accepted test emails (250 OK); sender name confirmed in Gmail. | **Pass** |
| **TC\_SH\_030** \[Negative\] | Visitor / Contact | Visitor submits with an empty field or invalid email. | Message not accepted. | Validation enforced (unit test). | **Pass** |
| **TC\_SH\_031** \[Negative\] | Visitor / Contact – spam | A bot fills the hidden honeypot field. | Submission silently discarded. | Honeypot discards submission. | **Pass** |
| **TC\_SH\_032** \[Negative\] | Visitor / Contact – flooding | Same visitor sends more than 5 messages within 10 minutes. | Further submissions refused (HTTP 429), per real visitor address. | Throttle uses the visitor's real IP behind Nginx. | **Pass** |
| **TC\_SH\_033** \[Negative\] | Visitor / Contact – cross-site | Another website posts to the contact form. | Request refused (HTTP 403). | Cross-origin form posts blocked. | **Pass** |
| **TC\_SH\_034** \[Negative\] | Visitor / Contact – markup | Visitor writes "Q&A \<b\>x\</b\>" in the message. | Stored and shown as "Q&A x" — markup removed, characters not garbled. | Literal text stored (unit test). | **Pass** |
| **TC\_SH\_035** \[Negative\] | Visitor / Contact – lockdown | Visitor sends a message while lockdown is on. | Submission refused with "temporarily disabled" (HTTP 503); nothing stored. | Blocked during lockdown (automated). | **Pass** |

## **Group 4: Public Website – Events Timeline (Gantt) & Executive Brief (9 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_036** \[Positive\] | Visitor / Events | Visitor opens Events. | Progress ring (% of 36 months elapsed), month counter, events held/planned and event cards. | Displayed correctly. | **Pass** |
| **TC\_SH\_037** \[Positive\] | Visitor / Gantt | Visitor views the Project Timeline. | Work packages WP1–WP5 as bars across real months (Jan 2025 – Dec 2027) with a "today" line. | Gantt renders with today marker. | **Pass** |
| **TC\_SH\_038** \[Positive\] | Visitor / Gantt tooltip | Visitor hovers a work-package bar, a deliverable diamond and an event. | Tooltip shows exact start/end dates, deliverables due, or event dates and place. | Tooltips with real dates shown. | **Pass** |
| **TC\_SH\_039** \[Positive\] | Visitor / Gantt – phone | Visitor opens the timeline on a phone. | Chart scrolls inside its own box; page does not scroll sideways. | Contained horizontal scroll. | **Pass** |
| **TC\_SH\_040** \[Positive\] | Visitor / Executive Brief | Visitor opens Executive Brief. | 12-page brief (summary, context, objectives, outcomes, consortium, work plan, timeline, deliverables, progress, contact) with contents navigation. | Brief renders with navigation. | **Pass** |
| **TC\_SH\_041** \[Positive\] | Visitor / Executive Brief – PDF | Visitor clicks Download PDF. | PDF downloads (SHAPE-Executive-Brief.pdf). | PDF served (HTTP 200, \~5 MB). | **Pass** |
| **TC\_SH\_042** \[Positive\] | Visitor / Executive Brief – print & share | Visitor uses Print and Copy link. | Print dialog opens with print layout; link copied. | Print and share work. | **Pass** |
| **TC\_SH\_043** \[Positive\] | Admin / Regenerate PDF | Admin clicks Regenerate PDF in the CMS. | New PDF generated from the current content. | Regeneration available (Chromium on server). | **Pass** |
| **TC\_SH\_044** \[Positive\] | Visitor / Executive Brief – phone | Visitor opens the brief on a phone. | Readable, no sideways scrolling. | Verified at iPhone 13 size. | **Pass** |

## **Group 5: SEO & Search Engine Indexing (12 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_045** \[Positive\] | Search engine / robots.txt | Open /robots.txt. | Allows the site; disallows /admin, /api/ and /search/; lists the sitemap URL. | Correct rules served. | **Pass** |
| **TC\_SH\_046** \[Positive\] | Search engine / Sitemap | Open /sitemap.xml as Googlebot. | Valid XML with 14 public URLs, last-modified dates and news images. | Valid, 14 URLs, fetched as Googlebot (HTTP 200). | **Pass** |
| **TC\_SH\_047** \[Positive\] | SEO / Titles & descriptions | View the source of Home, About, Events and News. | Each page has its own title and meta description; home title "SHAPE Project — Smart City Higher Education in East Africa". | Unique titles and descriptions confirmed. | **Pass** |
| **TC\_SH\_048** \[Positive\] | SEO / Canonical | View page source. | Canonical URL points to https\://shapeproject.ouk.ac.ke/…. | Canonical correct. | **Pass** |
| **TC\_SH\_049** \[Positive\] | SEO / Social sharing | Share a page on LinkedIn/X (preview). | Title, description and image preview (Open Graph and Twitter tags). | Tags present. | **Pass** |
| **TC\_SH\_050** \[Positive\] | SEO / Structured data – organisation & site search | View home page source. | JSON-LD Organization (OUK parent, EU funder) and WebSite with site search. | Present and valid. | **Pass** |
| **TC\_SH\_051** \[Positive\] | SEO / Structured data – breadcrumbs, articles, events | View an inner page, a news article and Events. | BreadcrumbList on inner pages; NewsArticle on articles; Event for held events. | Present (unit tested). | **Pass** |
| **TC\_SH\_052** \[Negative\] | SEO / Thin pages | View a tag archive and the search page. | Marked "noindex" and left out of the sitemap. | noindex applied. | **Pass** |
| **TC\_SH\_053** \[Positive\] | Google Search Console / Ownership | Verify the property https\://shapeproject.ouk.ac.ke with the HTML tag. | Ownership verified. | Verification tag live; property verified. | **Pass** |
| **TC\_SH\_054** \[Positive\] | Google Search Console / Live test | URL Inspection → Test live URL on /sitemap.xml. | "URL is available to Google". | Live test passed. | **Pass** |
| **TC\_SH\_055** \[Positive\] | Google Search Console / Sitemap status | Submitted sitemap shows "Success". | Status Success with discovered pages. | Shows "Couldn't fetch" pending Google's first read (known delay for new properties). | **Pending** |
| **TC\_SH\_056** \[Positive\] | Google Search / Indexing | Search Google for "SHAPE Project smart city East Africa". | Site appears in results. | Awaiting Google crawl after indexing request. | **Pending** |

## **Group 6: Website Analytics – Visitor, Click & Search Tracking (14 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_057** \[Positive\] | System / Page views | Visitor browses Home, Search, Events, Contact. | Each page view recorded with device, browser, system, language and referrer site. | Recorded (automated and unit tests). | **Pass** |
| **TC\_SH\_058** \[Positive\] | System / Clicks | Visitor clicks a link or button. | Click recorded with label and target. | "/contact/" appears under Most clicked (automated). | **Pass** |
| **TC\_SH\_059** \[Positive\] | System / Downloads, outbound and contact links | Visitor downloads a PDF, opens an external link and clicks the email/phone link. | Recorded as Download, Outbound and Contact (email/phone only, no address stored). | Recorded with correct types (unit test). | **Pass** |
| **TC\_SH\_060** \[Positive\] | System / Searches | Visitor searches "zzqx-nothing". | Search recorded with the number of results; zero-result terms listed under Content gaps. | Term shown under "Searches that found nothing" (automated). | **Pass** |
| **TC\_SH\_061** \[Positive\] | System / Broken links | Visitor opens a missing page. | Recorded under "Pages not found (404)" with an "Add a redirect" shortcut. | Listed (automated). | **Pass** |
| **TC\_SH\_062** \[Positive\] | System / Engagement | Visitor reads a page then leaves. | Engaged time (visible time only) and scroll depth recorded. | Recorded and averaged per page. | **Pass** |
| **TC\_SH\_063** \[Negative\] | Privacy / No cookies | Inspect the visitor's browser after browsing. | No cookies and no analytics storage on the device. | No cookies; only the preloader flag in storage (automated). | **Pass** |
| **TC\_SH\_064** \[Negative\] | Privacy / No IP stored | Inspect stored analytics data. | No IP address or full browser string stored; visitor id is a daily-salted hash; old salts destroyed. | Verified (unit tests). | **Pass** |
| **TC\_SH\_065** \[Negative\] | Accuracy / Staff excluded | Signed-in staff browse the public site. | Their visits are not counted. | Page views unchanged after staff visit (automated). | **Pass** |
| **TC\_SH\_066** \[Negative\] | Accuracy / Bots excluded | A search-engine bot or script requests pages. | Not counted. | Bots and headless clients dropped (unit test). | **Pass** |
| **TC\_SH\_067** \[Negative\] | Abuse / Cross-site and flooding | Another site posts fake events; one visitor sends >600 events/hour. | Cross-site posts ignored; excess events dropped. | Ignored and rate-limited (automated and unit tests). | **Pass** |
| **TC\_SH\_068** \[Negative\] | Abuse / Malformed input | Send events with admin paths, off-site paths, query strings or oversized text. | Admin/API/off-site paths rejected; query strings stripped; text clipped. | Rejected and cleaned (unit tests). | **Pass** |
| **TC\_SH\_069** \[Positive\] | System / Sessions | Visitor returns after 50 minutes. | Counted as a new session (30-minute gap rule). | Session split correctly (unit test). | **Pass** |
| **TC\_SH\_070** \[Positive\] | System / Retention | Events older than 400 days. | Removed automatically. | Retention rule in place. | **Pass** |

## **Group 7: CMS Authentication – Sign-in & Two-Step Verification (14 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_071** \[Negative\] | Visitor / CMS access | Visitor opens /admin without signing in. | Redirected to the sign-in page. | Redirect to /admin/login (automated). | **Pass** |
| **TC\_SH\_072** \[Negative\] | User / Sign-in | User enters a wrong password. | "Incorrect email or password." (HTTP 401). | Error shown (automated and live). | **Pass** |
| **TC\_SH\_073** \[Positive\] | User / First sign-in | User signs in for the first time. | Asked to set up two-step sign-in: QR code, manual key, then 6-digit code. | Enrolment screen shown (automated). | **Pass** |
| **TC\_SH\_074** \[Positive\] | User / Enrolment | User scans the QR code and enters the code. | "Two-step sign-in is on" with 8 single-use recovery codes (copy and print). | Recovery codes issued (automated). | **Pass** |
| **TC\_SH\_075** \[Positive\] | User / Later sign-ins | User signs in again. | Asked for the authenticator code; correct code opens the dashboard. | Works (automated). | **Pass** |
| **TC\_SH\_076** \[Negative\] | User / Code reuse | User re-enters a code already used. | "Invalid or already used code." | Replay blocked (automated). | **Pass** |
| **TC\_SH\_077** \[Positive\] | User / Recovery code | User signs in with a recovery code. | Accepted once; cannot be reused. | Single-use enforced (unit test). | **Pass** |
| **TC\_SH\_078** \[Negative\] | User / Code guessing | User enters wrong codes repeatedly. | Locked for 15 minutes. | Lockout enforced. | **Pass** |
| **TC\_SH\_079** \[Negative\] | User / Password guessing | User fails sign-in 5 times within 15 minutes. | "Too many attempts. Try again in N minutes." | Lockout enforced (automated). | **Pass** |
| **TC\_SH\_080** \[Negative\] | Attacker / Pending session | Attacker who knows the password but not the code tries /admin pages. | Only the code page is reachable; pending session expires after 10 minutes. | Gated (automated). | **Pass** |
| **TC\_SH\_081** \[Positive\] | User / Password toggle | User clicks the show/hide icon on a password field. | Password becomes visible and hidden again. | Toggle works (automated). | **Pass** |
| **TC\_SH\_082** \[Positive\] | Admin / Reset two-step | Admin resets a user's two-step sign-in from Users. | User must enrol again at next sign-in. | Reset available and audited. | **Pass** |
| **TC\_SH\_083** \[Negative\] | Attacker / Cross-site sign-in | Another website posts to the sign-in form. | Refused (HTTP 403). | 403 returned on live site. | **Pass** |
| **TC\_SH\_084** \[Positive\] | User / Code page layout | User views the code page on desktop and phone. | Code box and buttons fit inside the card. | Fixed and verified on desktop and phone. | **Pass** |

## **Group 8: CMS Session Management – Idle Timeout & Session Control (12 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_085** \[Positive\] | User / Idle warning | User leaves the CMS untouched for 55 minutes. | Dialog "Still there?" with a 5-minute countdown, "Stay signed in" and "Sign out now". | Countdown shown (automated with simulated clock). | **Pass** |
| **TC\_SH\_086** \[Positive\] | User / Stay signed in | User clicks "Stay signed in". | Dialog closes; session extended to a full 60 minutes. | Deadline reset to \~60 minutes (automated). | **Pass** |
| **TC\_SH\_087** \[Negative\] | User / Idle sign-out | User is inactive for more than 60 minutes, then clicks a link. | Signed out; sign-in page says "You were signed out after 60 minutes without activity." | Redirect with message (automated). | **Pass** |
| **TC\_SH\_088** \[Positive\] | User / Active work | User keeps typing or clicking for more than 60 minutes. | Session stays alive. | Sliding deadline (unit test). | **Pass** |
| **TC\_SH\_089** \[Negative\] | User / Idle tab | A CMS tab is left open but untouched. | Background status checks do not keep the session alive. | Status checks do not count as activity (unit test). | **Pass** |
| **TC\_SH\_090** \[Negative\] | User / Absolute limit | User stays active for 12 hours. | Signed out after 12 hours ("Your session has ended"). | Enforced (unit test). | **Pass** |
| **TC\_SH\_091** \[Negative\] | Attacker / Session fixation | Token issued before the authenticator code is reused after the code is entered. | Old token no longer works; a new token is issued. | Token rotated (unit test). | **Pass** |
| **TC\_SH\_092** \[Positive\] | User / Session list | User opens My account. | "Signed-in sessions" lists devices, IP and last activity, marking "This device". | Listed (automated). | **Pass** |
| **TC\_SH\_093** \[Positive\] | User / End other sessions | User clicks "Sign out" on another device or "Sign out all other sessions". | Those sessions end immediately. | Revocation works; tokens never shown (unit test). | **Pass** |
| **TC\_SH\_094** \[Negative\] | Admin / Role change or disable | Admin changes a user's role or disables them. | All of that user's sessions end at once. | Sessions ended (unit test). | **Pass** |
| **TC\_SH\_095** \[Negative\] | User / Password change | User changes their password. | Other sessions are signed out. | Other sessions ended. | **Pass** |
| **TC\_SH\_096** \[Positive\] | System / Cookie | Inspect the session cookie. | HttpOnly, Secure (HTTPS), SameSite=Lax, maximum 12 hours. | Cookie flags correct (unit test). | **Pass** |

## **Group 9: CMS Content Management – Editors, Validation, Duplicate & Revisions (16 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_097** \[Positive\] | Editor / Hero slides | Editor edits a hero slide title and saves. | "Saved" message; new title on the home page immediately. | Home page updated (automated). | **Pass** |
| **TC\_SH\_098** \[Negative\] | Editor / Validation | Editor clears a required field and saves. | Field-level errors shown; nothing saved. | Validation enforced (automated). | **Pass** |
| **TC\_SH\_099** \[Positive\] | Editor / Rich text | Editor formats text (headings, lists, links, images) in an article. | Formatting saved and shown on the site; unsafe markup removed. | Sanitised rich text. | **Pass** |
| **TC\_SH\_100** \[Negative\] | Editor / Unsafe links | Editor enters a "javascript:" link. | Link rejected. | Rejected (unit test). | **Pass** |
| **TC\_SH\_101** \[Positive\] | Editor / Repeaters | Editor adds, reorders and removes deliverables in a work package. | Changes saved in the right order. | Works (automated). | **Pass** |
| **TC\_SH\_102** \[Positive\] | Editor / Ordering | Editor drags items in a list to reorder them. | New order saved and used on the site. | Reorder works. | **Pass** |
| **TC\_SH\_103** \[Positive\] | Editor / Scheduling | Editor schedules a news post for a future date. | Post goes live at that date; staff can preview before. | Scheduled posts hidden until due. | **Pass** |
| **TC\_SH\_104** \[Positive\] | Editor / Duplicate | Editor clicks Duplicate on a thematic area. | Copy "(copy)" opens in the editor with a unique slug, saved as draft where drafts apply. | Copy created and edited (automated). | **Pass** |
| **TC\_SH\_105** \[Positive\] | Editor / Duplicate – everywhere | Editor duplicates items in each content type. | Duplicate available for every list collection. | Available CMS-wide. | **Pass** |
| **TC\_SH\_106** \[Positive\] | Editor / Revisions | Editor opens Revision history on an edited item. | All saved versions listed with author and time. | Revisions listed (automated). | **Pass** |
| **TC\_SH\_107** \[Positive\] | Editor / Compare | Editor compares two versions. | Field-by-field differences highlighted. | Compare works. | **Pass** |
| **TC\_SH\_108** \[Positive\] | Editor / Restore | Editor restores an older version. | Content restored; the restore itself becomes a new version. | Restore works (unit test). | **Pass** |
| **TC\_SH\_109** \[Negative\] | Editor / Admin-only areas | Editor opens Users, Settings, Navigation, Redirects or Administration. | "Forbidden: admins only" (HTTP 403). | Blocked (automated). | **Pass** |
| **TC\_SH\_110** \[Positive\] | Admin / Navigation | Admin changes the menu order and labels. | Menu updated on the website. | Navigation editable. | **Pass** |
| **TC\_SH\_111** \[Negative\] | Attacker / Cross-site edits | Another site sends a request to the CMS JSON API. | Refused. | Cross-origin API requests rejected (automated). | **Pass** |
| **TC\_SH\_112** \[Positive\] | Editor / Release notes collection | Admin duplicates and edits a release note. | Same duplicate, bin and revisions behaviour as other content. | Works. | **Pass** |

## **Group 10: CMS Media Library & Recycle Bin (11 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_113** \[Positive\] | Editor / Upload | Editor uploads a JPG/PNG and uses it on the Project Team page. | Image stored, resized variants created, shown on the page. | Works (automated). | **Pass** |
| **TC\_SH\_114** \[Negative\] | Editor / File type | Editor uploads a disguised or unsupported file (e.g. renamed executable). | Refused: "Unsupported file type". | Checked by file signature (automated). | **Pass** |
| **TC\_SH\_115** \[Negative\] | Editor / File size | Editor uploads a file larger than 20 MB. | "File is larger than 20 MB." | Limit enforced. | **Pass** |
| **TC\_SH\_116** \[Positive\] | Editor / Documents | Editor uploads a PDF/DOCX/PPTX deliverable and publishes it. | Downloadable on Materials. | Works (automated). | **Pass** |
| **TC\_SH\_117** \[Positive\] | Editor / Alt text | Editor sets alt text on an image. | Alt text saved and used on the site. | Saved. | **Pass** |
| **TC\_SH\_118** \[Negative\] | Editor / File in use | Editor deletes a file that is used by content. | Deletion refused, listing where it is used. | Usage check enforced. | **Pass** |
| **TC\_SH\_119** \[Positive\] | Editor / Delete to bin | Editor deletes a content item. | Item moves to the Recycle bin and disappears from the website. | Moved to bin (automated). | **Pass** |
| **TC\_SH\_120** \[Positive\] | Editor / Restore from bin | Editor restores the item from the Recycle bin. | Item returns to the list and website. | Restored (automated). | **Pass** |
| **TC\_SH\_121** \[Negative\] | Editor / Permanent delete | Editor tries "Delete permanently" or "Empty bin". | Admin only. | Restricted to admins. | **Pass** |
| **TC\_SH\_122** \[Positive\] | System / Auto-purge | Items older than 30 days in the bin. | Removed permanently. | Purge rule tested (unit test). | **Pass** |
| **TC\_SH\_123** \[Positive\] | Editor / Bin details | Editor views the bin. | Shows who deleted each item, when, and the purge date. | Shown. | **Pass** |

## **Group 11: CMS Engagement – Inbox & Comment Moderation (11 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_124** \[Positive\] | Staff / Inbox | Staff opens Inbox. | Folders Inbox, Unread, Starred, Archived, All mail with counts; list and reading pane. | Displayed. | **Pass** |
| **TC\_SH\_125** \[Positive\] | Staff / Read | Staff opens a message. | Message shown; marked as read; unread badge decreases. | Works (automated). | **Pass** |
| **TC\_SH\_126** \[Positive\] | Staff / Search | Staff searches by name, email, subject or text. | Matching messages listed. | Works (automated). | **Pass** |
| **TC\_SH\_127** \[Negative\] | Staff / Search – injection | Staff searches "x' OR 1=1 --". | No results; no error. | Parameterised query (unit test). | **Pass** |
| **TC\_SH\_128** \[Positive\] | Staff / Star & archive | Staff stars then archives a message. | Message moves to Starred/Archived; leaves Inbox. | Works (automated). | **Pass** |
| **TC\_SH\_129** \[Positive\] | Staff / Reply by email | Staff writes a reply and clicks Send email. | Reply emailed to the sender and recorded in the thread as "Emailed". | Send button available with SMTP configured. | **Pass** |
| **TC\_SH\_130** \[Positive\] | Staff / Record reply | Staff clicks "Record without sending". | Reply recorded in the thread as "Recorded only"; message tagged "Replied". | Works (automated). | **Pass** |
| **TC\_SH\_131** \[Negative\] | Staff / Double send | Staff refreshes the page after sending a reply. | Reply not sent twice. | Redirect-after-post prevents resend. | **Pass** |
| **TC\_SH\_132** \[Positive\] | Staff / Mark all read, delete | Staff uses "Mark all read" and deletes a message (with confirmation). | All marked read; deleted message removed. | Works. | **Pass** |
| **TC\_SH\_133** \[Positive\] | Staff / Comments | Staff opens Comments and approves or rejects pending comments. | Approved comments go live; pending count updates. | Works (automated). | **Pass** |
| **TC\_SH\_134** \[Positive\] | Staff / Inbox – phone | Staff opens Inbox on a phone. | List first, then message with Back button. | Responsive layout. | **Pass** |

## **Group 12: Administration – Users, Roles & Invitation Emails (13 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_135** \[Positive\] | Admin / Invite | Admin enters name, email and role (editor/admin) and clicks Invite. | Invitation created; page confirms "An invitation email was sent to …" and shows the link. | Works (automated). | **Pass** |
| **TC\_SH\_136** \[Positive\] | System / Invitation email | System action after TC\_SH\_135. | Branded email (OUK teal header, coral "Create my account" button, three lines) sent to the invitee. | Email captured and verified (automated). | **Pass** |
| **TC\_SH\_137** \[Positive\] | Invitee / Accept | Invitee opens the link and sets a password. | Account created and signed in. | Works (automated). | **Pass** |
| **TC\_SH\_138** \[Positive\] | System / Welcome email | System action after TC\_SH\_137. | Branded "Your SHAPE CMS account is ready" email with Sign in button. | Email captured and verified (automated); branded preview delivered to shape@ouk.ac.ke. | **Pass** |
| **TC\_SH\_139** \[Negative\] | Invitee / Weak password | Invitee enters a password without numbers or under 12 characters. | Rejected with guidance. | Rejected (automated). | **Pass** |
| **TC\_SH\_140** \[Negative\] | Invitee / Reused or expired link | Invitee opens the link a second time or after 7 days. | "This invite can no longer be used" / not found. | Single-use and expiry enforced. | **Pass** |
| **TC\_SH\_141** \[Negative\] | Admin / Duplicate email | Admin invites an email that already has an account. | "A user with that email already exists." | Blocked. | **Pass** |
| **TC\_SH\_142** \[Negative\] | Admin / Invalid input | Admin invites without a name or with an invalid email. | "Enter a name and a valid email." | Validated. | **Pass** |
| **TC\_SH\_143** \[Positive\] | Admin / Change role | Admin changes an editor to admin. | Role updated; the user's sessions end. | Works (unit test). | **Pass** |
| **TC\_SH\_144** \[Positive\] | Admin / Disable | Admin disables a user. | User cannot sign in; sessions end. | Works. | **Pass** |
| **TC\_SH\_145** \[Negative\] | Admin / Last admin | Admin tries to disable or demote the last active admin. | "At least one active admin is required." | Protected. | **Pass** |
| **TC\_SH\_146** \[Negative\] | Admin / Self change | Admin tries to change their own role or access. | Refused. | Protected. | **Pass** |
| **TC\_SH\_147** \[Negative\] | Email / Injection | Invitee name contains HTML. | Escaped in the email; no markup executed. | Escaped (unit test). | **Pass** |

## **Group 13: Administration – Audit Trail, Release Notes & System Overview (11 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_148** \[Positive\] | Admin / Audit trail | Admin opens Audit trail. | All actions listed with user, action, item, time, IP address and browser; 50 per page. | Displayed. | **Pass** |
| **TC\_SH\_149** \[Positive\] | Admin / Filters | Admin filters by user, area, action and date range, and searches. | Matching entries only. | Filters work. | **Pass** |
| **TC\_SH\_150** \[Positive\] | Admin / Changes | Admin expands a content save entry. | Fields changed shown before/after. | Diff shown. | **Pass** |
| **TC\_SH\_151** \[Positive\] | Admin / CSV export | Admin exports the audit trail. | CSV downloads; cells starting with = + - @ are neutralised. | Download with formula protection. | **Pass** |
| **TC\_SH\_152** \[Negative\] | Editor / Audit access | Editor opens the audit trail or its CSV. | Forbidden (admins only). | Blocked. | **Pass** |
| **TC\_SH\_153** \[Positive\] | Admin / Release notes | Admin creates a draft release note, then publishes it. | Appears in "What's new"; version shown in the sidebar. | Works (automated). | **Pass** |
| **TC\_SH\_154** \[Negative\] | Admin / Version format | Admin enters version "v2". | Rejected: semantic version required (e.g. 1.5.0). | Validated (unit test). | **Pass** |
| **TC\_SH\_155** \[Positive\] | Staff / What's new | Editor opens What's new. | Published release notes listed newest first. | Visible to all staff. | **Pass** |
| **TC\_SH\_156** \[Positive\] | Admin / System overview | Admin opens Administration → Overview. | Database and uploads size, item counts, schema version, current release, maintenance and lockdown status. | Displayed. | **Pass** |
| **TC\_SH\_157** \[Positive\] | System / Health check | Monitoring calls /healthz. | {"ok":true,"maintenance":false}. | Returned on live site. | **Pass** |
| **TC\_SH\_158** \[Positive\] | Admin / Activity on dashboard | Admin opens the dashboard. | Recent activity listed. | Shown. | **Pass** |

## **Group 14: Administration – Maintenance Mode & Lockdown (13 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_159** \[Positive\] | Admin / Maintenance on | Admin turns on maintenance with a message and planned end time. | Visitors see a branded maintenance page (HTTP 503, Retry-After). | Works (automated). | **Pass** |
| **TC\_SH\_160** \[Positive\] | Staff / Browse during maintenance | Signed-in staff open the public site. | Live site shown with a "Maintenance mode is on" banner. | Works (automated). | **Pass** |
| **TC\_SH\_161** \[Positive\] | Admin / Maintenance off | Admin turns maintenance off. | Visitors see the site again. | Works (automated). | **Pass** |
| **TC\_SH\_162** \[Positive\] | System / Deploy during maintenance | Deployment runs while maintenance is on. | Health check still passes; deployment not rolled back. | /healthz exempt. | **Pass** |
| **TC\_SH\_163** \[Negative\] | Admin / Lockdown confirmation | Admin clicks Turn on lockdown without typing LOCKDOWN. | "Type LOCKDOWN in capitals to confirm." | Enforced. | **Pass** |
| **TC\_SH\_164** \[Positive\] | Admin / Lockdown on | Admin types LOCKDOWN and confirms. | Every other session (admins included) signed out; red banner shown; action audited with counts. | Works (automated and unit tests). | **Pass** |
| **TC\_SH\_165** \[Negative\] | Editor / Sign-in during lockdown | Editor tries to sign in. | "The CMS is in lockdown. Only administrators can sign in right now." | Blocked (unit test). | **Pass** |
| **TC\_SH\_166** \[Negative\] | Attacker / Old invitation | Someone opens an invitation link sent before lockdown. | Link revoked; no account created. | Revoked and blocked (unit test; hole found and fixed in testing). | **Pass** |
| **TC\_SH\_167** \[Negative\] | Admin / New invites during lockdown | Admin tries to invite or change roles. | User management locked with explanation. | Locked (HTTP 423 / disabled forms). | **Pass** |
| **TC\_SH\_168** \[Negative\] | Visitor / Forms during lockdown | Visitor submits contact form or comment. | "Submissions are temporarily disabled" (HTTP 503). | Blocked (automated). | **Pass** |
| **TC\_SH\_169** \[Negative\] | Admin / Freeze | Lockdown with "Freeze edits" on; admin tries to save content. | Refused: "The CMS is read-only during lockdown" (HTTP 423). | Freeze enforced. | **Pass** |
| **TC\_SH\_170** \[Positive\] | Admin / Lift lockdown | Admin clicks Lift lockdown. | Normal operation resumes; queued contact messages accepted again. | Works (automated). | **Pass** |
| **TC\_SH\_171** \[Positive\] | Visitor / Sign-in page notice | A user opens sign-in during lockdown. | Notice "The CMS is in lockdown. Only administrators can sign in." | Shown. | **Pass** |

## **Group 15: CMS Dashboard, Analytics Screen & Responsive Layout (12 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_172** \[Positive\] | Staff / Dashboard | Staff opens the dashboard. | Key figures (posts, comments, messages, events, files), 14-day traffic chart, project progress ring, content mix, publishing activity, engagement sparklines, quick actions. | Displayed. | **Pass** |
| **TC\_SH\_173** \[Positive\] | Admin / Analytics KPIs | Admin opens Analytics. | Six cards (visitors, page views, engaged time, bounce rate, clicks, searches) with trend lines and change vs previous period. | Displayed (automated). | **Pass** |
| **TC\_SH\_174** \[Positive\] | Admin / Trend chart | Admin hovers the visitors chart or uses arrow keys. | Smooth curves; tooltip with the day's numbers; "Show as table" option. | Works (automated). | **Pass** |
| **TC\_SH\_175** \[Positive\] | Admin / Date range | Admin switches 7 days, 30 days, 90 days, 12 months. | All figures and charts update. | Works. | **Pass** |
| **TC\_SH\_176** \[Positive\] | Admin / Reports | Admin views top pages, sources, devices, browsers, systems, languages, most clicked, downloads, searches, content gaps, heatmap and live visitors. | All panels populated from recorded data. | Verified with seeded and live data. | **Pass** |
| **TC\_SH\_177** \[Positive\] | Admin / Analytics CSV | Admin clicks Export CSV. | CSV of raw events for the range. | Downloaded (automated). | **Pass** |
| **TC\_SH\_178** \[Negative\] | Visitor / Analytics CSV | Visitor requests the CSV without signing in. | Refused / redirected to sign-in. | Blocked (automated). | **Pass** |
| **TC\_SH\_179** \[Positive\] | Staff / Collapse sidebar | Staff clicks the sidebar button (or presses \[) on desktop. | Sidebar shrinks to icons with tooltips; choice remembered across pages. | Works (automated). | **Pass** |
| **TC\_SH\_180** \[Positive\] | Staff / Phone menu | Staff taps the same button on a phone. | Menu slides in; closes with ✕, backdrop tap, Escape or choosing a page. | Works (automated). | **Pass** |
| **TC\_SH\_181** \[Positive\] | Staff / Phone layout | Staff opens Analytics, Users, Inbox and editors at 390 px. | No sideways page scrolling; tables scroll inside cards. | Verified by screenshots. | **Pass** |
| **TC\_SH\_182** \[Positive\] | Admin / Users page layout | Admin opens Users. | Even summary tiles, tidy invite form; table becomes cards on phones. | Redesigned and verified. | **Pass** |
| **TC\_SH\_183** \[Positive\] | Staff / Accessibility | Staff navigates with keyboard only. | Visible focus, labelled controls, charts operable by keyboard with table view. | Verified. | **Pass** |

## **Group 16: Security, Performance & Deployment (Non-Functional) (16 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_SH\_184** \[Positive\] | Security / DAST – CMS | Authenticated HawkScan of the production build (all CMS pages). | No unresolved High findings. | 3 High alerts (XSS reflected, XSS in CSV, SQL injection) reproduced manually and confirmed false positives; triaged on StackHawk (scan 5c321d44). | **Pass** |
| **TC\_SH\_185** \[Positive\] | Security / DAST – live site | Public HawkScan of https\://shapeproject.ouk.ac.ke (forms and CMS excluded to protect live data). | No High findings; Medium findings fixed or justified. | No High. Proxy Disclosure fixed (TRACE/OPTIONS refused); Anti-CSRF token alert justified by origin checks (scan 6a537506). | **Pass** |
| **TC\_SH\_186** \[Positive\] | Security / Final rescans | Repeat both scans on the final release d2a2a47. | No new High findings. | CMS scan 36b7b8a6: High alerts (stored/reflected XSS) re-checked — stored text is escaped in pages and JSON, attributes quoted; triaged false positive. Live scan 8172cd3e: Nginx version hidden server-wide; remaining alerts justified and triaged. No open High findings. | **Pass** |
| **TC\_SH\_187** \[Positive\] | Security / Dependencies | Run npm audit; check all packages and runtime. | 0 vulnerabilities; latest compatible releases. | 0 vulnerabilities; Astro 7.4, Node adapter 11.1, Nodemailer 10.2, sharp 0.35, Playwright 1.64, Node.js 24.22.1 LTS, SQLite 3.53. 7 advisories (1 critical) cleared by upgrade. | **Pass** |
| **TC\_SH\_188** \[Positive\] | Security / Headers | Request any page. | CSP (no inline scripts), HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy. | All present (automated and live). | **Pass** |
| **TC\_SH\_189** \[Negative\] | Security / HTTP methods | Send TRACE, OPTIONS, PUT to the site. | HTTP 405. | 405 returned on live site. | **Pass** |
| **TC\_SH\_190** \[Positive\] | Security / TLS | Open http\://shapeproject.ouk.ac.ke. | Redirect to HTTPS; valid Let's Encrypt certificate (auto-renewing). | 301 to HTTPS; certificate valid to Jan 2027 with auto-renewal. | **Pass** |
| **TC\_SH\_191** \[Positive\] | Security / Stored XSS | Save script payloads in content and search index. | Stored text escaped everywhere; JSON in pages escaped. | Fixed during testing (search index) and verified. | **Pass** |
| **TC\_SH\_192** \[Positive\] | Availability / Service | Kill or reboot the application. | systemd restarts it; it starts at boot. | Service active, restart on failure. | **Pass** |
| **TC\_SH\_193** \[Positive\] | Deployment / Rollback | Deploy a release that fails to start. | Previous release restored automatically. | Rollback observed in a real failed deploy; site stayed up. | **Pass** |
| **TC\_SH\_194** \[Positive\] | Deployment / Location | Application moved from the home directory to /var/www/shapeproject. | Site, uploads, PDF, sitemap, admin and backups work from the new path. | All verified after the move. | **Pass** |
| **TC\_SH\_195** \[Positive\] | Recoverability / Backups | Nightly backup job and pre-deploy backup. | Database and uploads copied nightly (30 days); database copied before each deploy. | Nightly job installed and run; pre-deploy copies present. | **Pass** |
| **TC\_SH\_196** \[Positive\] | Coexistence / Shared server | HTTPS on port 443 shared with the SOMAS DR relay. | Both services reachable. | Routing by host name; SOMAS certificate still served. | **Pass** |
| **TC\_SH\_197** \[Positive\] | Quality / Automated tests | Run unit and end-to-end tests on the release. | All pass. | 76 unit and 28 end-to-end tests pass. | **Pass** |
| **TC\_SH\_198** \[Positive\] | Performance / Page load | Load public pages on the live site. | Pages load quickly; static assets cached for a year. | Server-rendered pages with long-term caching of assets. | **Pass** |
| **TC\_SH\_199** \[Positive\] | Maintainability / Documentation | Review the README. | Stack, setup, configuration, deployment, security and operations documented. | README complete. | **Pass** |

# **Backlog Management Index**

| No. | Issue Name | Description |
| :---: | ----- | ----- |
| **BM-001** | Google Search Console Sitemap Status | The submitted sitemap shows "Couldn't fetch" although the live test passes ("URL is available to Google"). This is normal for a new property. Re-check within 48 hours; if it persists, confirm with OUK ICT that the university firewall does not block Google's crawlers. Closes TC\_SH\_055 and TC\_SH\_056. |
| **BM-002** | Security Scan Follow-up (Closed) | Final scans of release d2a2a47 completed: CMS scan 36b7b8a6-ffd3-46e3-9b19-fbd6dc920186 and live scan 8172cd3e-b9ed-4afa-8957-fdd73991174c on the StackHawk application. All alerts triaged with reasons; `server_tokens off` set in `/etc/nginx/nginx.conf` so no Nginx version is exposed by any site on the server. Re-run `hawk scan stackhawk.yml` (local build) and `hawk scan stackhawk-live.yml` after each major release. |
| **BM-003** | Server Access Hardening and Credentials (Closed) | Done 27 Oct 2026: fail2ban, automatic security updates, key-only SSH for `wabwire` and `root`, sudo limited to SHAPE tasks (`deploy/harden-server.sh`); developer key protected by a passphrase; CMS admin password changed; StackHawk API key rotated; other server users moved to SSH keys. Optional next step: disable SSH password login server-wide once every account is confirmed key-only. |
| **BM-004** | Server Operating System Updates | About 70 Ubuntu packages on the shared server have updates. Node.js, Nginx and ImageMagick (used by this site) were updated; the rest belong to other services (Matrix, PHP sites, SOMAS DR relay) and should be scheduled by the server owners. |
| **BM-005** | Email Authentication Records | Outgoing mail uses the Google Workspace relay from 197.136.12.54. Ask the ouk.ac.ke Workspace admin to confirm SPF and DKIM cover the relay so emails do not land in spam. |
| **BM-006** | Shared Port 443 with SOMAS DR Relay | `/etc/nginx/somas-dr-stream.conf` now routes HTTPS by host name (shapeproject → local site, everything else → 10.0.0.2:443). Inform the SOMAS DR team; any future change to that file must keep this rule. **Status: SOMAS DR team informed (closed).** |
| **BM-007** | Privacy Notice for Analytics | Analytics is cookieless and stores no personal data, so no consent banner is needed. As good practice add one sentence to the website's privacy notice stating that anonymous visit statistics are collected. |
| **BM-008** | Image Library on Server CPU | The server's virtual CPU is too old for the fast image library (sharp); ImageMagick is used instead. Switching the VM CPU type to "host" (or x86-64-v2) would enable sharp. No functional impact. |
| **BM-009** | Inline Style Attributes in CSP | The Content Security Policy allows inline `style` attributes (used for chart and colour values). Scripts remain fully restricted. Low risk; may be tightened in a future release. |
| **BM-010** | Duplicate Uses the Last Saved Version | "Duplicate" in the editor copies the last saved version, not unsaved edits on screen (the tooltip says so). Save before duplicating. |
| **BM-011** | Files Used by Binned Items | A file referenced only by an item in the Recycle bin cannot be deleted until that item is purged or restored and changed. |
| **BM-012** | Lockdown Allows Other Administrators | During lockdown other administrators can still sign in (with two-step verification). If the incident involves an administrator account, disable that account first. |
| **BM-013** | About Page Editor on Phones | The About page editor (repeater fields) was fixed for small screens but not re-checked at 390 px after the last change. Re-check at next UAT round. |

# **Tester Approval / Sign-off**

Once all test cases yield a Pass result, or acceptable workarounds have been agreed upon, this document shall be signed off by the following representatives to confirm formal acceptance of the SHAPE Project website and CMS for production use and handover.

| No | Name | Designation | Date | Signature |
| :---- | :---- | :---- | :---- | :---- |
| 1\. |  | Vice-Chancellor – Open University of Kenya |  |  |
| 2\. |  | Principal Investigator – SHAPE Project |  |  |
| 3\. |  | ICT Director – OUK |  |  |
| 4\. |  | Lead User / CMS Administrator |  |  |
| 5\. |  | Business Analyst |  |  |
| 6\. |  | Technical Lead – OUK |  |  |
| 7\. |  | Developer – SHAPE Website & CMS |  |  |

