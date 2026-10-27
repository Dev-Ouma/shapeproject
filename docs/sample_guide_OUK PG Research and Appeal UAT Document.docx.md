

**OPEN UNIVERSITY OF KENYA**

**ERP SYSTEM IMPLEMENTATION**

**PG Research & Appeal Management Module**

**User Acceptance Testing (UAT) Document**

Version 1.0  
**21st September 2026**

**Contents**

**Revision History	4**

**Introduction	4**

**Scope	5**

**Definitions, Acronyms, and Abbreviations	5**

**Test Type & Categories	8**

**Functional Test Cases (User & Developer Perspective)	10**

**Group 1: PG Research – My Progress & Supervisor Assignment (16 Test Cases)	10**

**Group 2: PG Research – Proposal Phase: Submission & First Supervisor Review (18 Test Cases)	14**

**Group 3: PG Research – Proposal Phase: First Supervisor Rejection & Re-submission (12 Test Cases)	19**

**Group 4: PG Research – Proposal Phase: Dual Supervisor Approval & Validation (25 Test Cases)	23**

**Group 5: PG Research – Proposal Phase: Second Supervisor Approval & Final Routing (9 Test Cases)	30**

**Group 6: PG Research – Defence Date Request & 4-Tier Approval (19 Test Cases)	32**

**Group 7: PG Research – Defence Viva: Outcome Recording & Post-Defence Flow (5 Test Cases)	37**

**Group 8: PG Research – Research Phase: Progress Reports (12 Test Cases)	39**

**Group 9: PG Research – Draft Thesis Submission & Dual Supervisor Approval (4 Test Cases)	42**

**Group 10: PG Research – Notice of Completion & Viva Scheduling (8 Test Cases)	43**

**Group 11: PG Research – Graduation Level Viva & Examiner Review (8 Test Cases)	45**

**Group 12: PG Research – Publications: Submission & GS Admin Approval (4 Test Cases)	48**

**Group 13: PG Appeal – Appeal Period Setup (Admin) (8 Test Cases)	49**

**Group 14: PG Appeal – Appeal Category (Admin) (10 Test Cases)	52**

**Group 15: PG Appeal – Student Login: Raise an Appeal (17 Test Cases)	55**

**Group 16: PG Appeal – Trainer Login: Appeal Review (27 Test Cases)	59**

**Group 17: PG Appeal – HOD Login: Appeal Review by HOD (36 Test Cases)	65**

**Group 18: PG Appeal – Examiner Login: Appeal Review BOE (54 Test Cases)	74**

**Group 19: PG Appeal – Dean Login: Appeal Review by Dean (106 Test Cases)	82**

**Group 20: PG Appeal – GS Admin Login: Appeal Review GS (143 Test Cases)	85**

**Group 21: PG Appeal – Trainer Login: Appeal Panel Review (171 Test Cases)	87**

**Backlog Management Index	91**

**Tester Approval / Sign-off	93**

# **Revision History**

| No. | Date | Version | Description | Author | Application URL |
| :---: | :---: | :---: | ----- | ----- | ----- |
| **1\.**  | July 2026 | v1.0 | Initial User Acceptance Testing Document for the PG Research and Appeal Management Module  | — | https\://oukmydev.konza.go.ke/login |

# **Introduction**

This document records the User Acceptance Test (UAT) cases executed for the Postgraduate (PG) Research Management and PG Appeal Management modules. It covers the PG research lifecycle from My Progress and Supervisor Assignment through the Proposal Phase, Defence Date Request, Defence Viva, Research Phase, Draft Thesis, Notice of Completion, Viva Examinations, Examiner Review and Publications, together with the PG Appeal module: Appeal Period Setup, Appeal Category, student Raise an Appeal, and the Trainer, HOD, Examiner (BOE), Dean, GS Admin and Appeal Panel review stages.

# **Scope**

The scope of this UAT covers functional verification of: My Progress course-completion tracking and supervisor-assignment enablement; Supervisor Management (HOD workload distribution, dual-supervisor assignment and validation rules); the Proposal Phase (student submission, First and Second Supervisor review cycles, send-back, rejection and re-submission flows); the Defence Date Request and its four-tier approval chain (First Supervisor, Second Supervisor, HOD, GS Admin); Defence Viva (Zoom join, outcome recording and post-defence status); the Research Phase (Progress Report submission, review, sign-off and the minimum three-report gate); Draft Thesis Submission and dual-supervisor approval; Notice of Completion (HOD rejection, resubmission, approval and viva scheduling); Departmental, School and Graduation Level Viva Examinations; Examiner Review (send-back, re-approval chain, final approval and thesis marks management); and Publications (student submission, GS Admin send-back, resubmission and final approval).

For the PG Appeal module, the scope covers PG Appeal Period Setup and PG Appeal Category maintenance (Admin); the student Raise an Appeal flow (draft, submit, update, re-submit, duplicate and mandatory-field validation, Final Outcome and Meeting Details); Trainer/Supervisor Appeal Review (send back, recommend); HOD review (send back to supervisor, dismiss, uphold, refer to Dean); Examiner BOE review (reject, partially uphold, approve); Dean review (request documents, dismiss, uphold, refer to GS); GS Admin review (request documents, dismiss, partially uphold, uphold, assign panel); and Appeal Panel Review (request evidence, schedule hearing, review and approve), including appeal period closure. Non-functional aspects (performance, security, load) are outside the scope of this document.

All test cases must be executed in the designated UAT environment. Student Admissions, Examination and Graduation, and other modules are covered under their respective module UAT documents and are out of scope here.

# **Definitions, Acronyms, and Abbreviations**

| Acronym / Term | Full Form / Definition |
| ----- | ----- |
| **OUK** | Open University of Kenya |
| **ERP** | Enterprise Resource Planning |
| **UAT** | User Acceptance Testing |
| **TC** | Test Case |
| **TC\_PG** | Test Case – PG Research Management module |
| **TC\_PGA** | Test Case – PG Appeal Management module |
| **URL** | Uniform Resource Locator |
| **KOTDA** | Konza Technopolis Development Authority |
| **PG** | Postgraduate |
| **HOD / COD** | Head of Department / Chairperson of Department – the departmental approver for supervisor assignment, defence requests, Notice of Completion and Departmental Viva. |
| **Dean** | School-level approver responsible for the School Viva Examination and appeal review at school level. |
| **GS Admin** | Graduate School Administrator – schedules and approves defence requests and the Graduation Level Viva, reviews thesis marks and publications, and reviews appeals at Graduate School level. |
| **First / Second Supervisor** | The two supervisors assigned to a PG student by the HOD. Both must approve the proposal, defence request, progress reports and draft thesis. Also referred to as Trainer in the test steps. |
| **Examiner / BOE** | The Examiner (Board of Examiners) who reviews the final thesis, records thesis marks and reviews appeals at examiner level. |
| **My Progress** | Student screen showing course-work completion and enabling supervisor assignment. |
| **Proposal Phase** | Stage in which the student submits a research proposal for dual-supervisor review and requests a defence date. |
| **Defence Viva** | Virtual proposal defence (Zoom) at which supervisors record the defence outcome. |
| **Research Phase** | Stage following an approved defence, comprising Progress Reports, Draft Thesis and Notice of Completion. |
| **Progress Report** | Periodic report submitted by the student and signed off by the supervisors. A minimum of three approved reports is required before the Draft Thesis module is unlocked. |
| **Draft Thesis** | The student's draft thesis submitted for First and Second Supervisor approval. |
| **NOC** | Notice of Completion – submitted by the student after Draft Thesis approval and approved by the HOD before viva scheduling. |
| **Departmental / School / Graduation Level Viva** | The three viva examinations held sequentially at HOD, Dean and GS Admin level following an approved Notice of Completion. |
| **Thesis Marks Approval** | GS Admin review of the marks recorded by the Examiner, which may be sent back to the Examiner for editing. |
| **Publications** | Student submission of publication evidence, reviewed by GS Admin; approval makes the student eligible for certificate generation and graduation. |
| **Appeal Period** | The cohort-specific date range during which students may raise a PG appeal. |
| **Appeal Panel** | A Trainer assigned by the GS Admin to review an appeal at panel level, request additional evidence, schedule a hearing and approve the appeal. |
| **BOE Verdict** | The Board of Examiners' original thesis and viva marks shown to reviewers when assessing an appeal. |
| **Appeal Category** | A configured classification (code and name) that a student selects when raising an appeal. |
| **Cohort** | A group of students admitted in the same intake period. |
| **Positive Test Case** | A test scenario verifying that the system behaves correctly with valid input and expected user actions |
| **Negative Test Case** | A test scenario verifying that the system correctly handles invalid input, missing information, or error conditions |
| **Pass** | Indicates that a test case executed successfully and met the expected outcome |
| **Fail** | Indicates that a test case did not meet the expected outcome during execution |
| **Pending** | Indicates that no Pass/Fail result has been recorded for the test case in the source UAT record |
| **Conditional** | Group status assigned where one or more test cases are Failed or Pending, so the group cannot yet be reported as Passed |
| **Sign-off** | Formal acceptance of the module after successful completion of User Acceptance Testing |

# **Test Type & Categories**

**Test Type: Manual Test**  
**Total Test Cases Executed: 712**

| Group | Functional Module | Total Test Cases | UAT Status |
| :---: | ----- | :---: | :---: |
| **Group 1** | PG Research – My Progress & Supervisor Assignment | 16 | **Passed** |
| **Group 2** | PG Research – Proposal Phase: Submission & First Supervisor Review | 18 | **Passed** |
| **Group 3** | PG Research – Proposal Phase: First Supervisor Rejection & Re-submission | 12 | **Passed** |
| **Group 4** | PG Research – Proposal Phase: Dual Supervisor Approval & Validation | 25 | **Conditional** |
| **Group 5** | PG Research – Proposal Phase: Second Supervisor Approval & Final Routing | 9 | **Passed** |
| **Group 6** | PG Research – Defence Date Request & 4-Tier Approval | 19 | **Passed** |
| **Group 7** | PG Research – Defence Viva: Outcome Recording & Post-Defence Flow | 5 | **Passed** |
| **Group 8** | PG Research – Research Phase: Progress Reports | 12 | **Passed** |
| **Group 9** | PG Research – Draft Thesis Submission & Dual Supervisor Approval | 4 | **Passed** |
| **Group 10** | PG Research – Notice of Completion & Viva Scheduling | 8 | **Passed** |
| **Group 11** | PG Research – Graduation Level Viva & Examiner Review | 8 | **Passed** |
| **Group 12** | PG Research – Publications: Submission & GS Admin Approval | 4 | **Passed** |
| **Group 13** | PG Appeal – Appeal Period Setup (Admin) | 8 | **Conditional** |
| **Group 14** | PG Appeal – Appeal Category (Admin) | 10 | **Passed** |
| **Group 15** | PG Appeal – Student Login: Raise an Appeal | 17 | **Passed** |
| **Group 16** | PG Appeal – Trainer Login: Appeal Review | 27 | **Passed** |
| **Group 17** | PG Appeal – HOD Login: Appeal Review by HOD | 36 | **Passed** |
| **Group 18** | PG Appeal – Examiner Login: Appeal Review BOE | 54 | **Passed** |
| **Group 19** | PG Appeal – Dean Login: Appeal Review by Dean | 106 | **Passed** |
| **Group 20** | PG Appeal – GS Admin Login: Appeal Review GS | 143 | **Passed** |
| **Group 21** | PG Appeal – Trainer Login: Appeal Panel Review | 171 | **Passed** |

**Execution Summary**

| Metric | Count | Percentage |
| ----- | :---: | :---: |
| Total Test Cases | 712 | 100% |
| Passed | 705 | 99.0% |
| Failed | 2 | 0.3% |
| Pending (no result recorded) | 5 | 0.7% |

# **Functional Test Cases (User & Developer Perspective)**

## **Group 1: PG Research – My Progress & Supervisor Assignment (16 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​01** \[Positive\] | Student login / My Progress | Student clicks on My Progress screen. | System displays Course work completion % and status as "Pending". Assign Supervisor button is disabled. | Pending status displayed correctly. | **Pass** |
| **TC\_​PG\_​02** \[Positive\] | Student login / My Progress | Student clicks on My Progress screen with all courses confirmed. | System displays Course work completion 100% and status as "Completed". Assign Supervisor button is enabled. | Completion triggers button enablement. | **Pass** |
| **TC\_​PG\_​03** \[Positive\] | Student login / My Progress | Student progress to 1st year with all courses confirmed. | System successfully sends the student registration number to Supervisor Management for further processing. | Record forwarded to HOD queue. | **Pass** |
| **TC\_​PG\_​04** \[Positive\] | COD login / Supervisor Management | HOD clicks on the Supervisor Management screen. | The system displays supervisor workload distribution details. Average Workload Per Supervisor: 15 students. | Workload grid displayed correctly. | **Pass** |
| **TC\_​PG\_​05** \[Positive\] | COD login / Supervisor Management | 1\. HOD clicks Assign Supervisor. 2\. Selects students from dropdown. 3\. Selects supervisor and mentor roles. 4\. Clicks Add Supervisor. 5\. Clicks Save Assignments. | The system displays a popup: "Created Successfully." | Dual supervisor assigned successfully. | **Pass** |
| **TC\_​PG\_​06** \[Negative\] | COD login / Supervisor Management | COD clicks Assign Supervisor and selects an already-assigned student from dropdown. | The system will not show the student details on the dropdown after TC\_PG\_05 is completed. | The student registration number and name will not appear on the Grid. | **Pass** |
| **TC\_​PG\_​07** \[Positive\] | COD login / Supervisor Management | COD enters the registration number. Clicks Search. | The system displays Supervisor 1 and Supervisor 2 details in the Supervisor Management panel. | The supervisor panel populated correctly. | **Pass** |
| **TC\_​PG\_​08** \[Negative\] | HOD login / Supervisor Management | HOD selects the same supervisor already assigned as First Supervisor and clicks Add Supervisor. | System displays popup: "Supervisor already added." | Duplicate supervisor blocked. | **Pass** |
| **TC\_​PG\_​09** \[Negative\] | HOD login / Supervisor Management | HOD selects the same supervisor already assigned with the same role (Second Supervisor) and clicks Add Supervisor. | System displays popup: "Supervisor already added with the same role." | Duplicate role validation confirmed. | **Pass** |
| **TC\_​PG\_​10** \[Negative\] | HOD login / Supervisor Management | HOD leaves the registration number blank and clicks Search. | System displays popup: "Please enter a registration number." | Mandatory field validation. | **Pass** |
| **TC\_​PG\_​11** \[Negative\] | HOD login / Supervisor Management | HOD does not select a student from the dropdown and clicks Save Assignments. | System displays popup: "Please add at least one supervisor." | No-student validation confirmed. | **Pass** |
| **TC\_​PG\_​12** \[Negative\] | HOD login / Supervisor Management | HOD selects a supervisor (ARJUN M) who already has 15 students assigned. | System displays popup: "More than 15 Students not allowed for this supervisor." | Workload cap enforced. | **Pass** |
| **TC\_​PG\_​13** \[Negative\] | HOD login / Supervisor Management | HOD adds only one supervisor and clicks Save Assignments. | The system displays a popup: "Please add at least two supervisors." | Minimum two supervisors rule enforced. | **Pass** |
| **TC\_​PG\_​14** \[Negative\] | HOD login / Supervisor Management | 1\. HOD enters invalid registration number (e.g. 12345). 2\. Clicks Search. | System displays popup: "Student not found." | Invalid reg. number handled. | **Pass** |
| **TC\_​PG\_​15** \[Positive\] | HOD login / Supervisor Management | HOD completes full supervisor assignment flow for a new student (two supervisors, different roles, Save Assignments). | The system displays a popup: "Created Successfully." | Repeat assignment flow confirmed. | **Pass** |
| **TC\_​PG\_​16** \[Positive\] | Student login / My Progress | Student clicks on My Progress screen after supervisor assignment by HOD. | The system displays assigned trainers in the Assign Supervisors section. | Assigned supervisors visible to students. | **Pass** |

## **Group 2: PG Research – Proposal Phase: Submission & First Supervisor Review (18 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​17** \[Positive\] | HOD login / Supervisor Management | HOD completes supervisor assignment. | The system successfully enables the Proposal Phase screen for the student. | Proposal Phase unlocked after assignment. | **Pass** |
| **TC\_​PG\_​18** \[Positive\] | Student login / Proposal Phase | 1\. Student enters Research Title and Abstract Snippet. 2\. Uploads PDF file. 3\. Clicks Submit for Review. | The system displays a popup: "Proposal submitted successfully." | Initial proposal submission confirmed. | **Pass** |
| **TC\_​PG\_​19** \[Positive\] | Student login / Proposal Phase | Student views My Progress after proposal submission. | Supervisor Review status shows "In Review". Proposal Defence is enabled. Proposal status displays 33%. | Progress counter and status updated. | **Pass** |
| **TC\_​PG\_​20** \[Positive\] | Student login / Proposal Phase | Student views Proposal Phase after submission. | Research Title, Abstract Snippet, Attach Proposal, and Submit for Review fields are greyed out. | Fields correctly locked post-submission. | **Pass** |
| **TC\_​PG\_​21** \[Positive\] | Student login / Proposal Phase | System action after proposal submission. | The system sends proposal submission records to the First Supervisor's Proposal Submission Approval screen. | Record routed to First Supervisor queue. | **Pass** |
| **TC\_​PG\_​22** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor clicks on the Proposal Submission Approval screen. | The system displays proposal submission details in a grid table with status "Submitted". | Submission visible in supervisor queue. | **Pass** |
| **TC\_​PG\_​23** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views Proposal Submission Approval screen. | System shows Pending count: 1\. | Pending counter accurate. | **Pass** |
| **TC\_​PG\_​24** \[Positive\] | First Supervisor login / Proposal Submission Approval | 1\. Supervisor clicks Review. 2\. Enters comments and uploads PDF. 3\. Selects “Request Further Correction”. 4\. Checks sign-off checkbox. 5\. Clicks Sign & Submit. 6\. Confirms “Sent Back” popup. | The system displays a popup: “Feedback submitted successfully.” | Send-back flow completed. | **Pass** |
| **TC\_​PG\_​25** \[Positive\] | First Supervisor login / Proposal Submission Approval | Supervisor clicks Supervisor Comments button. | System displays supervisor comments in the Supervisor Comments screen. | Comments viewable post-review. | **Pass** |
| **TC\_​PG\_​26** \[Positive\] | First Supervisor login / Proposal Submission Approval | System action after First Supervisor send-back. | System sends the send-back record back to the student's Proposal Phase screen for further action. | Record returned to student. | **Pass** |
| **TC\_​PG\_​27** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views status after sending back. | Status changes from "Pending" to "First Request Further Correction". | Status label updated correctly. | **Pass** |
| **TC\_​PG\_​28** \[Positive\] | Student login / Proposal Phase | Students click the file / history button on Proposal Phase. | Proposal History shows status "First Request Further Correction" with supervisor comments and uploaded document link. | History populated with correct status. | **Pass** |
| **TC\_​PG\_​29** \[Positive\] | Student login / Proposal Phase | Student views Proposal Phase after First Supervisor send-back. | Supervisor Review status displays "Send Back". | Send Back status visible to student. | **Pass** |
| **TC\_​PG\_​30** \[Positive\] | Student login / Proposal Phase | Student views Proposal Phase after send-back. | Proposal Phase screen is visible and enabled, allowing the student to access and interact with all applicable fields. | Form re-enabled for resubmission. | **Pass** |
| **TC\_​PG\_​31** \[Positive\] | Student login / Proposal Phase | 1\. Student updates Research Title and Abstract Snippet. 2\. Changes uploaded PDF. 3\. Clicks Submit for Review. | System displays popup: "Proposal submitted successfully." | Resubmission after send-back confirmed. | **Pass** |
| **TC\_​PG\_​32** \[Positive\] | Student login / Proposal Phase | Student views My Progress after resubmission. | Supervisor Review status shows “In Review”. Proposal Defence enabled. Proposal status displays 33%. | Status restored to In Review. | **Pass** |
| **TC\_​PG\_​33** \[Positive\] | Student login / Proposal Phase | Student views Proposal Phase after resubmission. | Research Title, Abstract Snippet, Attach Proposal, and Submit fields are greyed out. | Fields locked after resubmission. | **Pass** |
| **TC\_​PG\_​34** \[Positive\] | Student login / Proposal Phase | System action after student resubmission. | System sends resubmitted proposal record to the First Supervisor's Proposal Submission Approval screen. | Resubmission routed to First Supervisor. | **Pass** |

## **Group 3: PG Research – Proposal Phase: First Supervisor Rejection & Re-submission** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​35** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views Proposal Submission Approval screen after student resubmission. | System displays the updated proposal record in grid table with status "Re-submitted". | Re-submitted status visible. | **Pass** |
| **TC\_​PG\_​36** \[Positive\] | First Supervisor login / Proposal Submission Approval | Supervisor clicks Abstract button on re-submitted record. | System displays the updated abstract text entered by the student in the Trainer Abstract Comments screen. | Updated abstract rendered correctly. | **Pass** |
| **TC\_​PG\_​37** \[Positive\] | First Supervisor login / Proposal Submission Approval | Supervisor clicks the uploaded file button. | System displays the student-uploaded file. Clicking the link opens the document for viewing. “File Uploaded Successfully” | Document viewable by supervisor. | **Pass** |
| **TC\_​PG\_​38** \[Positive\] | First Supervisor login / Proposal Submission Approval | 1\. Supervisor clicks Review. 2\. Enters comments and uploads PDF. 3\. Selects "Reject Submission". 4\. Checks sign-off checkbox. 5\. Clicks Sign & Submit. 6\. Confirms rejection popup. | System displays popup: "Feedback submitted successfully." | Rejection flow completed. | **Pass** |
| **TC\_​PG\_​39** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views status after rejecting. | Status changes from "Re-submitted" to "First Supervisor Rejected". | Rejection status label corrected. | **Pass** |
| **TC\_​PG\_​40** \[Positive\] | Student login / Proposal Phase | Student views Proposal History after First Supervisor rejection. | Proposal History shows status "First Supervisor Rejected" with supervisor comments. | Rejection visible in history. | **Pass** |
| **TC\_​PG\_​41** \[Positive\] | Student login / Proposal Phase | Students view supervisor comments and review status after rejection. | Supervisor comments displayed. Supervisor Review status shows "Rejected". | Rejected status communicated to students. | **Pass** |
| **TC\_​PG\_​42** \[Positive\] | Student login / Proposal Phase | Student accesses Proposal Phase after rejection. | System clears all previously entered proposal data and displays a fresh proposal submission form. | Form reset for new submission. | **Pass** |
| **TC\_​PG\_​43** \[Positive\] | Student login / Proposal Phase | 1\. Student enters new Research Title and Abstract Snippet. 2\. Uploads PDF. 3\. Clicks Submit for Review. | System displays popup: "Proposal submitted successfully." | Fresh submission after rejection confirmed. | **Pass** |
| **TC\_​PG\_​44** \[Positive\] | Student login / Proposal Phase | Student views My Progress after new submission. | Supervisor Review shows "In Review". Proposal Defence enabled. Proposal status at 33%. | Status reset and updated. | **Pass** |
| **TC\_​PG\_​45** \[Positive\] | Student login / Proposal Phase | Student views Proposal Phase after new submission. | Research Title, Abstract Snippet, Attach Proposal, and Submit fields are greyed out. | Fields locked after submission. | **Pass** |
| **TC\_​PG\_​46** \[Positive\] | Student login / Proposal Phase | System action after a student submits a new proposal. | System sends proposal submission record to First Supervisor's Proposal Submission Approval screen. | Routed to First Supervisor correctly. | **Pass** |

## **Group 4: PG Research – Proposal Phase: Dual Supervisor Approval & Validation** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​47** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views Proposal Submission Approval screen. | System displays proposal submission details in grid table with status "Submitted". | Submitted record visible. | **Pass** |
| **TC\_​PG\_​48** \[Positive\] | First Supervisor login / Proposal Submission Approval | 1\. Supervisor clicks Review. 2\. Enters comments and uploads PDF. 3\. Selects "Approve Submission". 4\. Checks sign-off checkbox. 5\. Clicks Sign & Submit. 6\. Confirms approval popup. | System displays popup: "Feedback submitted successfully." | First Supervisor approval completed. | **Pass** |
| **TC\_​PG\_​49** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views status after approval. | Status changes from "Submitted" to "First Supervisor Approved". | Status label updated. | **Pass** |
| **TC\_​PG\_​50** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views supervisor review status. | Supervisor "In Review" status changes to "Approved". | Approved status confirmed. | **Pass** |
| **TC\_​PG\_​51** \[Positive\] | First Supervisor login / Proposal Submission Approval | Supervisor clicks Supervisor Comments button after approval. | System fetches and displays supervisor comments in the Supervisor Comments screen. | Comments retrievable post-approval. | **Pass** |
| **TC\_​PG\_​52** \[Positive\] | First Supervisor login / Proposal Submission Approval | System action after First Supervisor approval. | The system forwards the approved proposal record to the Second Supervisor for further review. | Record forwarded to Second Supervisor. | **Pass** |
| **TC\_​PG\_​53** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor clicks the Proposal Submission Approval screen. | The system displays proposal record in grid with status “First Supervisor Approved”. | Record visible in Second Supervisor queue. | **Pass** |
| **TC\_​PG\_​54** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor selects supervisor from dropdown filter. | System fetches and displays records filtered by the selected supervisor. | Supervisor filter working. | **Pass** |
| **TC\_​PG\_​55** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor selects "Pending" from status dropdown. | System displays records with status "Pending" in the grid. | Status filter working. | **Pass** |
| **TC\_​PG\_​56** \[Positive\] | Second Supervisor login / Proposal Submission Approval | 1\. Second Supervisor clicks Search. 2\. Enter student name. | System fetches the searched student record in the grid table. | Search functionality confirmed. | **Pass** |
| **TC\_​PG\_​57** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor clicks Supervisor Comments button. | System displays First Supervisor's comments in the Supervisor Comments screen. | Prior supervisor comments viewable. | **Pass** |
| **TC\_​PG\_​58** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor clicks Abstract button. | System displays the abstract entered by the student in the Trainer Abstract Comments screen. | Abstract viewable by Second Supervisor. | **Pass** |
| **TC\_​PG\_​59** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor clicks Uploaded File button. | System displays the student-uploaded file. Clicking the link opens the document for viewing. | Document accessible. | **Pass** |
| **TC\_​PG\_​60** \[Positive\] | Second Supervisor login / Proposal Submission Approval | 1\. Second Supervisor clicks Review. 2\. Enters comments and uploads PDF. 3\. Selects "Request Further Correction". 4\. Checks sign-off checkbox. 5\. Clicks Sign & Submit. 6\. Confirms send-back popup. | System displays popup: "Feedback submitted successfully\!" | Second Supervisor send-back confirmed. | **Pass** |
| **TC\_​PG\_​61** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor clicks Supervisor Comments after send-back. | System displays updated supervisor comments. | Updated comments retrievable. | **Pass** |
| **TC\_​PG\_​62** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor views status after send-back (Second Supervisor login). | Status changes from “First Supervisor Approved” to “Second Request Further Correction”. | Status label updated (2nd Supervisor view). | **Pass** |
| **TC\_​PG\_​63** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views status after Second Supervisor send-back. | Status changes from "First Supervisor Approved" to "Second Request Further Correction". | Status reflected in First Supervisor view. | **Pass** |
| **TC\_​PG\_​64** \[Positive\] | Second Supervisor login / Proposal Submission Approval | System action after Second Supervisor send-back. | System makes the send-back record available on the student's Proposal Phase screen for further action. | Record returned to student. | **Pass** |
| **TC\_​PG\_​65** \[Positive\] | Student login / Proposal Phase | Student views Proposal Phase after Second Supervisor send-back. | Proposal History shows status "Second Request Further Correction". | History updated with correct status. | **Pass** |
| **TC\_​PG\_​66** \[Positive\] | Student login / Proposal Phase | Student views supervisor comments on Proposal Phase. | System fetches and displays Second Supervisor send-back comments. | Second Supervisor comments visible. | **Pass** |
| **TC\_​PG\_​67** \[Positive\] | Student login / Proposal Phase | Student views Supervisor Review status. | System displays Supervisor Review as "Locked". | Locked status displayed correctly. | **Pass** |
| **TC\_​PG\_​68** \[Negative\] | Student login / Proposal Phase | Students click Submit for Review without entering a Research Title. | The system displays a popup: "Please enter the proposal title." | Title field validation confirmed. | **Fail** |
| **TC\_​PG\_​69** \[Negative\] | First Supervisor login / Proposal Submission Approval | 1\. Supervisor clicks Review. 2\. Leaves comments, upload file, and sign-off checkbox blank. 3\. Clicks Sign & Submit. | System displays error: "Please fill in all required fields." | Mandatory fields validation on review form. | **Pass** |
| **TC\_​PG\_​70** \[Negative\] | First Supervisor login / Proposal Submission Approval | Supervisor enters comments but uploads an Excel file instead of a PDF. | System displays popup: "Upload PDF format only and size less than 8 MB." | Invalid file type rejected. | **Pass** |
| **TC\_​PG\_​77** \[Negative\] | First Supervisor login / Proposal Submission Approval | Student clicks Submit for Review without uploading a proposal PDF. | System displays popup: "Please upload proposal PDF." | Missing PDF validation confirmed. | **Fail** |

## **Group 5: PG Research – Proposal Phase: Second Supervisor Approval & Final Routing** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​70** \[Positive\] | Student login / Proposal Phase | 1\. Student updates Research Title and Abstract. 2\. Changes uploaded PDF. 3\. Clicks Submit for Review. | System displays popup: "Proposal submitted successfully." | Resubmission after Second Supervisor send-back. | **Pass** |
| **TC\_​PG\_​78** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor reviews resubmitted proposal and selects "Approve Submission". Checks sign-off. Clicks Sign & Submit. | System displays popup: "Feedback submitted successfully." | Second cycle First Supervisor approval. | **Pass** |
| **TC\_​PG\_​90** \[Positive\] | Second Supervisor login / Proposal Submission Approval | 1\. Second Supervisor clicks Review. 2\. Enters comments. 3\. Selects "Reject Submission". 4\. Checks sign-off. 5\. Clicks Sign & Submit. 6\. Confirms rejection popup. | System displays popup: "Feedback submitted successfully." | Second Supervisor rejection confirmed. | **Pass** |
| **TC\_​PG\_​91** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor views status after rejection. | Status changes from "Re-submitted" to "Second Supervisor Rejected". | Rejection status label updated. | **Pass** |
| **TC\_​PG\_​94** \[Positive\] | Student login / Proposal Phase | Student accesses Proposal Phase after Second Supervisor rejection. | System clears all previously entered proposal data and displays a fresh submission form. | Form reset for new submission. | **Pass** |
| **TC\_​PG\_​112** \[Positive\] | Second Supervisor login / Proposal Submission Approval | 1\. Second Supervisor clicks Review. 2\. Enters comments. 3\. Selects "Approve Submission". 4\. Checks sign-off. 5\. Clicks Sign & Submit. 6\. Confirms approval popup. | System displays popup: "Feedback submitted successfully." | Second Supervisor final approval. | **Pass** |
| **TC\_​PG\_​113** \[Positive\] | Second Supervisor login / Proposal Submission Approval | Second Supervisor views status after approval. | Status changes from "First Supervisor Approved" to "Second Supervisor Approved". | Final approval status updated. | **Pass** |
| **TC\_​PG\_​115** \[Positive\] | First Supervisor login / Proposal Submission Approval | First Supervisor views status after Second Supervisor approval. | Status displays "Second Supervisor Approved". | Status reflected in First Supervisor view. | **Pass** |
| **TC\_​PG\_​116** \[Positive\] | Second Supervisor login / Proposal Submission Approval | System checks Defence Date Request availability after both supervisor approvals. | System allows the student to request a defence only after both date supervisor approvals. | Defence Date Request gating enforced. | **Pass** |

## **Group 6: PG Research – Defence Date Request & 4-Tier Approval** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​117** \[Positive\] | Student login / Proposal Phase — Defence Scheduling | Student views Defence Date Request section after both supervisor approvals. | System displays Defence Date Request status as "Open". | Open status displayed correctly. | **Pass** |
| **TC\_​PG\_​118** \[Positive\] | Student login / Proposal Phase — Defence Scheduling | Student clicks Request Defence Date button. | System displays popup: "Defence date requested successfully." | Defence date request submitted. | **Pass** |
| **TC\_​PG\_​119** \[Positive\] | Student login / Proposal Phase — Defence Scheduling | Student views Request Defence Date button after clicking it once. | Request Defence Date button is displayed in disabled mode. | Button disabled after single use. | **Pass** |
| **TC\_​PG\_​120** \[Positive\] | Student login / Proposal Phase — Defence Scheduling | System action after student requests defence date. | System sends defence request record to First Supervisor's Defence Request Approval screen. | Record forwarded to First Supervisor. | **Pass** |
| **TC\_​PG\_​121** \[Positive\] | First Supervisor login / Defence Request Approval | First Supervisor clicks Defence Request Approval screen. | System displays request with status "Pending". | Pending status shown. | **Pass** |
| **TC\_​PG\_​122** \[Positive\] | First Supervisor login / Defence Request Approval | First Supervisor clicks Approve. | System displays popup: "Approved successfully." | First Supervisor approval confirmed. | **Pass** |
| **TC\_​PG\_​123** \[Positive\] | First Supervisor login / Defence Request Approval | First Supervisor views status after approval. | Status changes from "Pending" to "First Supervisor Approved". | Status updated correctly. | **Pass** |
| **TC\_​PG\_​124** \[Positive\] | First Supervisor login / Defence Request Approval | First Supervisor views Approve button after clicking it once. | Approve button is displayed in disabled mode. | Button disabled after use. | **Pass** |
| **TC\_​PG\_​125** \[Positive\] | First Supervisor login / Defence Request Approval | System action after First Supervisor approval. | System forwards defence request approval record to Second Supervisor. | Routed to Second Supervisor. | **Pass** |
| **TC\_​PG\_​126** \[Positive\] | Second Supervisor login / Defence Request Approval | Second Supervisor clicks Defence Request Approval screen. | System displays request with status “First Supervisor Approved”. | Record visible to Second Supervisor. | **Pass** |
| **TC\_​PG\_​128** \[Positive\] | Second Supervisor login / Defence Request Approval | Second Supervisor clicks Approve. | System displays popup: "Approved successfully." | Second Supervisor approval confirmed. | **Pass** |
| **TC\_​PG\_​129** \[Positive\] | Second Supervisor login / Defence Request Approval | Second Supervisor views status after approval. | Status changes from "First Supervisor Approved" to "Second Supervisor Approved". | Status updated correctly. | **Pass** |
| **TC\_​PG\_​132** \[Positive\] | Second Supervisor login / Defence Request Approval | System action after both supervisors approves defence request. | System sends defence request approval record to HOD's Defence Request Approval screen. | Routed to HOD. | **Pass** |
| **TC\_​PG\_​133** \[Positive\] | HOD login / Defence Request Approval | HOD clicks Approve button. | System displays popup: "Defence Request Date Approved Successfully." | HOD approval confirmed. | **Pass** |
| **TC\_​PG\_​134** \[Positive\] | HOD login / Defence Request Approval | System action after HOD approval. | System sends defence request approval record to GS Admin's Defence Request Approval screen. | Routed to GS Admin. | **Pass** |
| **TC\_​PG\_​136** \[Positive\] | GS Admin login / Defence Request Approval | 1\. GS Admin navigates to Pending Defence Requests. 2\. Selects HOD-approved request. 3\. Clicks Approve and confirms date/time. | Final Status: Scheduled. Zoom link generated and visible on Student and Trainer login Proposal Phase screens. | Defence scheduled; Zoom link generated. | **Pass** |
| **TC\_​PG\_​144** \[Positive\] | Student login / Proposal Phase — Defence Scheduling | 1\. Full 4-tier approval chain completed. 2\. Student logs in and checks dashboard. | "Join Virtual Proposal Defence" button is displayed and active for the student. | Join button visible after full approval. | **Pass** |
| **TC\_​PG\_​150** \[Positive\] | Student login / Proposal Phase — Defence Scheduling | 1\. System time set to scheduled defence | Button is enabled and redirects to Zoom application. | Join button active on scheduled date. | **Pass** |
| **TC\_​PG\_​151** \[Positive\] | Student login / Proposal Phase — Defence Scheduling | Students click the "Join Virtual Proposal Defence" button. | Students are redirected to the Zoom / Google Meeting link. | Zo date. 2\. Student clicks Join Virtual Proposal Defence. om redirect confirmed. | **Pass** |

## **Group 7: PG Research – Defence Viva: Outcome Recording & Post-Defence Flow** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​137** \[Positive\] | First Supervisor login / Scheduled Vivas | 1\. First Supervisor clicks Join (Zoom redirect). 2\. Clicks Record Outcome. 3\. Enters comments. 4\. Selects "Reject" from dropdown. | First Supervisor rejects the defence. System forces the student to restart from Proposal Submission. | Rejection restarts proposal flow. | **Pass** |
| **TC\_​PG\_​152** \[Positive\] | First Supervisor login / Defence Request Approval | 1\. First Supervisor clicks Join (Zoom). 2\. Clicks Record Outcome. 3\. Enters comments. 4\. Selects "Approved". 5\. Submits. | First Supervisor's outcome saved. Record remains pending Second Supervisor outcome. | First Supervisor approval recorded. | **Pass** |
| **TC\_​PG\_​153** \[Positive\] | Second Supervisor login / Defence Request Approval | 1\. Second Supervisor clicks Join (Zoom). 2\. Clicks Record Outcome. 3\. Enters comments. 4\. Selects "Approved". 5\. Submits. | Second Supervisor's outcome saved. System marks the collective defence status as "Approved". | Both approvals → Approved status. | **Pass** |
| **TC\_​PG\_​154** \[Positive\] | Student login / Defence Request Approval | Student logs in after both supervisors have submitted "Approved" outcomes. | Status displays "Approved". "Join Virtual Proposal Defence" button is disabled. | Post-defence button state correct. | **Pass** |
| **TC\_​PG\_​155** \[Positive\] | Student login / Research Phase | 1\. Students log in after defence approval. 2\. Navigates to Research Phase. 3\. Checks if Progress Report Submission is accessible. | The Research Phase module is unlocked and enabled for the student. | Research Phase unlocked after defence approval. | **Pass** |

## **Group 8: PG Research – Research Phase: Progress Reports**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​159** \[Positive\] | Student login / Research Phase — Progress Reports | 1\. Student navigates to Research Phase \> Progress Reports. 2\. Uploads report file. 3\. Clicks Submit. | Report uploaded successfully. Status updates to "Pending". | Initial report submission confirmed. | **Pass** |
| **TC\_​PG\_​160** \[Positive\] | First Supervisor login / Research Reports Review | 1\. Trainer opens the pending Progress Report. 2\. Enters comments. 3\. Selects "Request Further Information". 4\. Clicks Submit. | Status updates to "Request Further Information". Student notified for revision. | Send-back with comments confirmed. | **Pass** |
| **TC\_​PG\_​161** \[Positive\] | Student login / Research Phase — Progress Reports | 1\. Student navigates to the Sent Back report. 2\. Uploads revised document. 3\. Clicks Resubmit. | Status updates to "Resubmitted — Pending Review". | Resubmission after send-back confirmed. | **Pass** |
| **TC\_​PG\_​162** \[Positive\] | First Supervisor login / Research Reports Review | 1\. Trainer reviews resubmitted report. 2\. Check the "I hereby sign by decision" checkbox. 3\. Clicks Sign & Submit. | Report status updates to "Approved". Progress counter increments by 1\. | Sign-off and approval confirmed. | **Pass** |
| **TC\_​PG\_​163** \[Positive\] | Student login / Research Phase — Progress Reports | Student navigates to Research Dashboard and checks Approved Reports count. | Total count reflects the correct number of signed-off reports. | Progress counter accurate. | **Pass** |
| **TC\_​PG\_​165** \[Positive\] | First Supervisor login / Research Reports Review | 1\. Trainer selects pending report. 2\. Selects "Reject" from dropdown. 3\. Enters rejection reasons. 4\. Clicks Submit. | Report status updated to "Rejected". Submission locked from further trainer action. | Rejection with mandatory comments confirmed. | **Pass** |
| **TC\_​PG\_​166** \[Positive\] | Student login / Research Phase — Progress Reports | 1\. Student navigates to Progress Reports history. 2\. Checks status of the recently submitted report. | Status displayed as "Rejected". Trainer comments are visible to the student. | Rejection status and comments visible. | **Pass** |
| **TC\_​PG\_​167** \[Positive\] | Student login / Research Phase — Progress Reports | Student checks Approved Reports count before and after rejection. | Counter remains unchanged. Rejected reports do not contribute to the minimum 3 requirement. | Counter unchanged on rejection. | **Pass** |
| **TC\_​PG\_​168** \[Positive\] | Student login / Research Phase — Progress Reports | 1\. Student attempts to edit the rejected report. 2\. Verifies the required action path. | Student must initiate a new submission. Original rejected record is archived as read-only. | New submission required after rejection. | **Pass** |
| **TC\_​PG\_​169** \[Negative\] | Student login / Research Phase — Progress Reports | 1\. Student navigates to Draft Thesis Submission. 2\. Checks if module is enabled (approved count \< 3). | Draft Thesis module remains disabled/locked due to insufficient approved progress reports. | Draft Thesis locked correctly. | **Pass** |
| **TC\_​PG\_​174** \[Positive\] | Second Supervisor login / Research Reports Review | 1\. Trainer reviews final resubmission. 2\. Checks "I hereby sign" checkbox. 3\. Clicks Sign & Submit. | Status: "Approved". Progress counter increments. | Final sign-off confirmed. | **Pass** |
| **TC\_​PG\_​175** \[Negative\] | Student login / Research Phase | 1\. Student ensures only 1 or 2 reports are approved. 2\. Attempts to open Draft Thesis Submission module. | Module remains locked/disabled. | Minimum 3 reports gate enforced. | **Pass** |

## **Group 9: PG Research – Draft Thesis Submission & Dual Supervisor Approval** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​176** \[Positive\] | Student login / Draft Thesis Submission | 1\. Student submits Draft Thesis. 2\. First Supervisor selects "Request for further" with comments. 3\. Student verifies status "Sent Back". 4\. Student edits Draft and resubmits. | Draft status returns to Student for editing. Resubmission moves record back to First Supervisor. | Send-back and resubmission cycle confirmed. | **Pass** |
| **TC\_​PG\_​177** \[Positive\] | First Supervisor login / Draft Thesis Approval | 1\. After Student Resubmit the Thesis Submission. 2\. First Supervisor reviews resubmitted Draft and clicks "Reject". 3\. Student verifies status "Rejected". 4\. Student uploads a fresh Draft and submits. | Draft rejected. Student performs full resubmission. Record returns to First Supervisor. | Rejection triggers fresh submission. | **Pass** |
| **TC\_​PG\_​178** \[Positive\] | First Supervisor login / Draft Thesis Approval | 1\. First Supervisor reviews final resubmitted Draft. 2\. Clicks "Approve" and enters positive feedback. | Status updates to "Approved by 1st Supervisor". Record moves to Second Supervisor queue. | First Supervisor approval confirmed. | **Pass** |
| **TC\_​PG\_​179** \[Positive\] | Second Supervisor login / Draft Thesis Approval | 1\. Second Supervisor locates Draft approved by First Supervisor. 2\. Reviews and clicks "Approve". | Final Draft Thesis status updates to "Approved by Supervisors". | Second Supervisor approval confirmed. | **Pass** |

## **Group 10: PG Research – Notice of Completion & Viva Scheduling** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​180** \[Positive\] | Student login / Research Phase — Notice of Completion | 1\. Student logs in after Draft Thesis dual approval. 2\. Navigates to Research Phase Dashboard. 3\. Checks NOC module status. | NOC module is active and enabled. Student can enter title and date. | NOC module unlocked after thesis approval. | **Pass** |
| **TC\_​PG\_​181** \[Positive\] | HOD login / Notice of Completion Approval | 1\. HOD navigates to Notice of Completion Approval. 2\. Selects student record. 3\. Clicks Review. 4\. Enters rejection comments and selects "Reject". 5\. Clicks Submit. | NOC status updates to "Rejected". Student notified to resubmit. | HOD rejection of NOC confirmed. | **Pass** |
| **TC\_​PG\_​182** \[Positive\] | Student login / Notice of Completion | 1\. Student navigates to Notice of Completion. 2\. Updates details per HOD comments. 3\. Clicks Submit. | NOC resubmitted successfully. Status updates to "Pending HOD Approval". | Student resubmission after HOD rejection. | **Pass** |
| **TC\_​PG\_​183** \[Positive\] | HOD login / Notice of Completion Approval | 1\. HOD navigates to NOC Approval. 2\. Selects resubmitted record. 3\. Enters approval comments. 4\. Clicks Approve. | NOC status updates to "Approved". "Schedule Viva" button is now enabled and clickable for the HOD. | HOD approval enables Schedule Viva. | **Pass** |
| **TC\_​PG\_​185** \[Positive\] | HOD login / Departmental Viva Examination | 1\. HOD navigates to Schedule Viva. 2\. Enters Viva details (Date, Time, Venue/Link). 3\. Clicks Schedule Viva. | Viva successfully scheduled. Notification sent to student and panel members. | Departmental Viva scheduling confirmed. | **Pass** |
| **TC\_​PG\_​186** \[Positive\] | HOD login / Departmental Viva Examination | 1\. HOD clicks Join. 2\. Clicks Record Outcome. 3\. Enters comments. 4\. Selects "Approve". 5\. Clicks Submit. | Departmental Viva status marked as "Approved". Record moves to Dean automatically. | Departmental Viva outcome recorded. | **Pass** |
| **TC\_​PG\_​187** \[Positive\] | Dean login / School Viva Examination | 1\. Dean navigates to Schedule Viva. 2\. Selects student records from HOD. 3\. Enter schedule details. 4\. Clicks Schedule Viva. | School level Viva scheduled. "Join" button visible on Dean and Student dashboards. | Dean schedules School Viva. | **Pass** |
| **TC\_​PG\_​188** \[Positive\] | Dean login / School Viva Examination | 1\. Dean clicks Join. 2\. Clicks Record Outcome. 3\. Selects "Approved". 4\. Clicks Submit. | School Viva status marked as "Approved". Record moves to GS Admin for Graduation Level Viva. | Dean approval routes to GS Admin. | **Pass** |

## **Group 11: PG Research – Graduation Level Viva & Examiner Review** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​190** \[Positive\] | GS Admin login / Graduation Level Viva | 1\. GS Admin schedules Graduation Viva. 2\. Selects "Reject" outcome. 3\. Submits. | Flow restarts from Draft Thesis Submission. NOC and all Vivas must be repeated. | Full restart on GS Admin rejection. | **Pass** |
| **TC\_​PG\_​191** \[Positive\] | Student login / Examiner Dashboard | 1\. Full Draft/NOC/Viva cycle completed again. 2\. Student submits Examination details. 3\. The examiner selects "Rejected" and submits. | Total flow restart. Students must redo Draft Thesis, NOC, and all 3 Vivas. | Examiner rejection triggers complete restart. | **Pass** |
| **TC\_​PG\_​192** \[Positive\] | Examiner login / Examiner Dashboard | 1\. Examiner navigates to Examiner Dashboard. 2\. Selects "Send Back" with comments. 3\. Clicks Submit. | Status updates to "Sent Back by Examiner". Record returns to Student login for resubmission. | Examiner send-back confirmed. | **Pass** |
| **TC\_​PG\_​194** \[Positive\] | First Trainer login / Final Thesis Submission Review | 1\. Student resubmits. 2\. The 1st Supervisor approves. 3\. Trainer 1 approves. 4\. Trainer 2 approves. | Record traverses the internal departmental chain and reaches the Examiner again. | Re-approval chain confirmed post-send-back. | **Pass** |
| **TC\_​PG\_​195** \[Positive\] | Examiner login / Examiner Dashboard | 1\. Examiner reviews thesis (v2) and internal approval history. 2\. Selects "Approved". 3\. Clicks Submit. | Final Thesis status marked as "Approved by Examiner". | Examiner final approval confirmed. | **Pass** |
| **TC\_​PG\_​196** \[Positive\] | GS Admin login / Thesis Marks Approval | 1\. Admin logs in. 2\. Navigates to Thesis Marks Approval. 3\. Searches for Examiner-approved student record. | System successfully sends Examiner record to Admin for Thesis Marks Approval. | Record visible in Admin marks queue. | **Pass** |
| **TC\_​PG\_​197** \[Positive\] | GS Admin login / Thesis Marks Approval | 1\. GS Admin selects student record. 2\. Clicks Review. 3\. Selects "Send Back" with comments. 4\. Submits. 5\. Examiner edits marks as requested. | Status updates to "Sent Back for Editing". Examiner can modify the marks field. | Marks send-back to Examiner confirmed. | **Pass** |
| **TC\_​PG\_​198** \[Positive\] | Examiner login / Examiner Dashboard | 1\. Examiner clicks Review. 2\. Enters comments. 3\. Uploads file. 4\. Selects "Approved" from dropdown. 5\. Clicks Submit. | After Examiner approves thesis marks, student proceeds to Publications module. | Marks approval unlocks Publications. | **Pass** |

## **Group 12: PG Research – Publications: Submission & GS Admin Approval** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PG\_​199** \[Positive\] | Student login / Publications | 1\. Student navigates to Publications. 2\. Enters publication title, journal name. 3\. Uploads proof file. 4\. Clicks Submit. | Publication submitted successfully. Status updates to "Pending Admin Review". | Initial publication submission confirmed. | **Pass** |
| **TC\_​PG\_​200** \[Positive\] | GS Admin login / Research Publications Review | 1\. GS Admin opens pending publication. 2\. Selects "Send Back". 3\. Enters revision comments. 4\. Clicks Submit. | Status updates to "Sent Back to Student". Record appears in student's revision queue. | Send-back flow confirmed. | **Pass** |
| **TC\_​PG\_​201** \[Positive\] | Student login / Publications | 1\. Student navigates to Sent Back publication. 2\. Updates details or uploads new file. 3\. Clicks Resubmit. | Status updates back to "Pending Admin Review". | Resubmission after send-back confirmed. | **Pass** |
| **TC\_​PG\_​202** \[Positive\] | GS Admin login / Research Publications Review | 1\. GS Admin reviews resubmitted publication. 2\. Clicks Approve. | Publication status marked as "Approved". Student status updates to "Eligible for Certificate Generation and Graduation". | Final approval triggers graduation eligibility. | **Pass** |

## **Group 13: PG Appeal – Appeal Period Setup** 

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​01** | Admin Login / PG Appeal Period Setup | Verify admin adding PG appeal period setup record. 1\. Admin clicks on Add button. 2\. Create screen opens. 3\. Select Cohort from dropdown. 4\. Select Start Date and End Date. 5\. Click Save. **Test Data:** Cohort: May 2026; Appeal Start Date: 02-06-2026; Appeal End Date: 31-07-2026; Status: Active | System displays alert popup: "Created Successfully." |  | **Pending** |
| **TC\_​PGA\_​02** | Admin Login / PG Appeal Period Setup | Verify record appears in grid after save. Review grid table after saving. | The system displays saved records in the grid table. |  | **Pending** |
| **TC\_​PGA\_​03** | Admin Login / PG Appeal Period Setup | Verify action button opens update screen. Admin clicks on the Action button. | System displays saved details in update screen. |  | **Pending** |
| **TC\_​PGA\_​04** | Admin Login / PG Appeal Period Setup | Verify admin updating PG appeal period setup record. 1\. Click the Action button. 2\. Update screen opens. 3\. Change Start/End dates. 4\. Click Update. | System displays alert: "Updated successfully." |  | **Pending** |
| **TC\_​PGA\_​05** | Admin Login / PG Appeal Period Setup | Verify updated record reflects in grid. Review grid table after update. | System displays updated record in grid. |  | **Pending** |
| **TC\_​PGA\_​06** | Admin Login / PG Appeal Period Setup | Verify mandatory field validation on empty form. 1\. Click Add. 2\. Leave Cohort, Start Date, End Date blank. 3\. Observe Save button. **Test Data:** Cohort: \[blank\]; Start Date: \[blank\]; End Date: \[blank\] | Save button displayed in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​07** | Admin Login / PG Appeal Period Setup | Verify search functionality. Enter cohort name in search box. **Test Data:** Cohort: December 1 | Matching cohort record displayed in grid. |  | **Pass** |
| **TC\_​PGA\_​08** | Admin Login / PG Appeal Period Setup | Verify duplicate cohort appeal period rejected. 1\. Click Add. 2\. Select the same Cohort. 3\. Select dates. 4\. Click Save. **Test Data:** Cohort: December 1 (duplicate) | The system displays an error: "Appeal period already exists for this cohort." |  | **Pass** |

## **Group 14: PG Appeal – Appeal Category (Admin) (10 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​10** | Admin Login / PG Appeal Category | Verify admin adding PG appeal category record. 1\. Click Add. 2\. Enter Category Code and Name. 3\. Click Save. **Test Data:** Category Code: PGAC001; Category Name: Admission Appeal; Status: Active | System displays alert: "Created successfully." |  | **Pass** |
| **TC\_​PGA\_​11** | Admin Login / PG Appeal Category | Verify record appears in grid after save. Review grid table after saving. | System displays saved record in grid. |  | **Pass** |
| **TC\_​PGA\_​12** | Admin Login / PG Appeal Category | Verify action button opens update screen. Admin clicks on the Action button. | The system displays saved details in the update screen. |  | **Pass** |
| **TC\_​PGA\_​13** | Admin Login / PG Appeal Category | Verify admin updating appeal category record. 1\. Click Action. 2\. Change Category Code and Name. 3\. Click Update. **Test Data:** Category Code: PGAC002; Category Name: Fee Payment Appeal | System displays alert: "Updated successfully." |  | **Pass** |
| **TC\_​PGA\_​14** | Admin Login / PG Appeal Category | Verify updated record reflects in grid. Review grid after update. | Updated category record displayed in grid. |  | **Pass** |
| **TC\_​PGA\_​15** | Admin Login / PG Appeal Category | Verify mandatory field validation. 1\. Click Add. 2\. Leave Category Code and Name blank. 3\. Observe Save. **Test Data:** Category Code: \[blank\]; Category Name: \[blank\] | Save button displayed in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​16** | Admin Login / PG Appeal Category | Verify search functionality. Enter category name in search box. **Test Data:** Category Name: Fee Payment Appeal | Matching record displayed in grid. |  | **Pass** |
| **TC\_​PGA\_​17** | Admin Login / PG Appeal Category | Verify pagination. Admin clicks on page 2\. | System navigates to second page successfully. |  | **Pass** |
| **TC\_​PGA\_​18** | Admin Login / PG Appeal Category | Verify duplicate category records rejected. 1\. Click Add. 2\. Enter the same Code and Name. 3\. Click Save. **Test Data:** Category Code: PGAC001; Category Name: Admission Appeal | System displays error: "Appeal category code or name already exists." |  | **Pass** |
| **TC\_​PGA\_​19** | Admin Login / PG Appeal Category | Verify appeal category is available in student raise appeal screen. Navigate to student login Raise an Appeal screen. | PG Appeal Category record appears in student Raise an Appeal screen. |  | **Pass** |

## **Group 15: PG Appeal – Student Login: Raise an Appeal (17 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​20** | Student Login / My Progress / Examination Phase | Verify Raise an Appeal button is enabled after Examination Phase completion. Complete Examination Phase; observe Raise an Appeal button. | Raise an Appeal button displayed in enabled state. |  | **Pass** |
| **TC\_​PGA\_​21** | Student Login / Raise an Appeal | Verify clicking Raise an Appeal redirects to form. Student clicks Raise an Appeal button. | System redirects user to Raise an Appeal screen. |  | **Pass** |
| **TC\_​PGA\_​22** | Student Login / Raise an Appeal | Verify student saves appeal as draft. 1\. Click Add. 2\. Auto-populated fields verified. 3\. Select Appeal Category. 4\. Enter Subject and Justification. 5\. Upload document. 6\. Click Save as Draft. **Test Data:** Student: SUJAY W; Reg No: ST64/00121/2025; Category: Fee Payment Appeal; Subject: Appeal Status Not Updating | System displays alert: "Created Successfully." |  | **Pass** |
| **TC\_​PGA\_​23** | Student Login / Raise an Appeal | Verify saved draft record shows correct details. Review grid after saving draft. | Saved record displays with correct details. |  | **Pass** |
| **TC\_​PGA\_​24** | Student Login / Raise an Appeal | Verify draft status is Pending. Check status of saved draft. **Test Data:** Status: Pending | Record status displayed as "Pending". |  | **Pass** |
| **TC\_​PGA\_​25** | Student Login / Raise an Appeal | Verify appeal reference and submission date are absent for draft. Check grid for draft record. | Appeal Reference No and Submission Date not displayed for draft. |  | **Pass** |
| **TC\_​PGA\_​26** | Student Login / Raise an Appeal | Verify Action button is enabled for draft record. Check Action button state. | Action button displayed in enabled mode. |  | **Pass** |
| **TC\_​PGA\_​27** | Student Login / Raise an Appeal | Verify student submits appeal from draft. 1\. Click Action. 2\. Open Raise an Appeal screen. 3\. Click Submit. **Test Data:** All fields pre-filled from draft. | System displays alert: "Created Successfully." |  | **Pass** |
| **TC\_​PGA\_​28** | Student Login / Raise an Appeal | Verify status changes to Submitted after submission. Check status after submission. **Test Data:** Status: Submitted | Status changes from "Pending" to "Submitted". |  | **Pass** |
| **TC\_​PGA\_​29** | Student Login / Raise an Appeal | Verify appeal reference and submission date display after submission. Check grid record. **Test Data:** Appeal Ref: APP-2026-0043; Submission Date: 2026-06-02 | Appeal Reference Number and Submission Date displayed in grid. |  | **Pass** |
| **TC\_​PGA\_​30** | Student Login / Raise an Appeal | Verify Action button is disabled after submission. Check Action button state. | Action button displayed in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​31** | Student Login / Raise an Appeal | Verify duplicate appeal submission is rejected. 1\. Click Add. 2\. Fill all fields. 3\. Click Submit. **Test Data:** Same appeal details as already submitted. | System displays error: "Appeal request already submitted." |  | **Pass** |
| **TC\_​PGA\_​32** | Student Login / Raise an Appeal | Verify mandatory field validation on submit. 1\. Click Add. 2\. Leave Category, Subject, Justification, Document blank. 3\. Click Submit. **Test Data:** All mandatory fields blank. | System displays validation errors for all missing fields. |  | **Pass** |
| **TC\_​PGA\_​33** | Student Login / Raise an Appeal | Verify submitted appeal is sent to the Trainer Appeal Review screen. Check Trainer login after student submission. | Appeal record appears in Trainer login Appeal Review screen. |  | **Pass** |
| **TC\_​PGA\_​34** | Student Login / Raise an Appeal | Verify search functionality. Enter the appeal type in the search box. | Matching appeal record displayed in grid. |  | **Pass** |
| **TC\_​PGA\_​35** | Student Login / Raise an Appeal | Verify pagination. Admin clicks on page 2\. | The system navigates to the second page successfully. |  | **Pass** |
| **TC\_​PGA\_​36** | Student Login / Raise an Appeal | Verify submitted appeal propagates to Trainer Appeal Review for processing. Check Trainer login. | Raise an Appeal form successfully sent to Trainer login for further review. |  | **Pass** |

## **Group 16: PG Appeal – Trainer Login: Appeal Review (27 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​37** | Trainer Login / Appeal Review | Verify submitted appeal appears in Trainer Appeal Review grid. Trainer opens Appeal Review screen. **Test Data:** Status: Submitted | Appeal record displayed with status "Submitted" in grid. |  | **Pass** |
| **TC\_​PGA\_​38** | Trainer Login / Appeal Review | Verify appeal details view shows student-submitted data. Trainer clicks Appeal Details View button. **Test Data:** Student: SUJAY W; Category: FEE PAYMENT APPEAL | Student-submitted details displayed correctly in appeal details screen. |  | **Pass** |
| **TC\_​PGA\_​39** | Trainer Login / Appeal Review | Verify BOE Verdict section displays correctly. Trainer clicks BOE Verdict button. **Test Data:** Thesis Marks: 42/70; Viva Marks: 25/30 | BOE verdict details displayed correctly. |  | **Pass** |
| **TC\_​PGA\_​40** | Trainer Login / Appeal Review | Verify supporting documents can be opened. Trainer clicks Supporting Documents View button. | Supporting document file opens successfully. |  | **Pass** |
| **TC\_​PGA\_​41** | Trainer Login / Appeal Review | Verify trainer sends back student appeal. 1\. Click Send Back. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: Trainer send back student appeal form | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​42** | Trainer Login / Appeal Review | Verify status changes to Supervisor Sent Back after send back. Check status after send back. **Test Data:** Status: Supervisor Sent Back | Status changes to "Supervisor Sent Back". |  | **Pass** |
| **TC\_​PGA\_​43** | Trainer Login / Appeal Review | Verify Recommend and Send Back buttons are disabled after send back. Check action button states. | Recommend and Send Back buttons displayed in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​44** | Trainer Login / Appeal Review | Verify send back comments are visible to student. Check student login View Comments screen. **Test Data:** Comments: Trainer send back student appeal form | Trainer send back comments displayed in student login view comments screen. |  | **Pass** |
| **TC\_​PGA\_​45** | Trainer Login / Appeal Review | Verify status propagates to student login screen after send back. Check student login raise appeal status. **Test Data:** Status: Supervisor Sent Back | Status updated to "Supervisor Sent Back" in student login. |  | **Pass** |
| **TC\_​PGA\_​46** | Trainer Login / Appeal Review | Verify send back record is sent to student for re-submission. Check student login raise appeal screen. | Appeal review record sent to student login for further review. |  | **Pass** |
| **TC\_​PGA\_​47** | Trainer Login / Appeal Review | Verify Action button is enabled for student after send back. Check Action button on student login. | Action button displayed in enabled mode on student login. |  | **Pass** |
| **TC\_​PGA\_​48** | Trainer Login / Appeal Review | Verify Send Back without comments is rejected. 1\. Click Send Back. 2\. Leave comments blank. 3\. Click Save. **Test Data:** Comments: \[blank\] | System displays alert: "Please enter comments." |  | **Pass** |
| **TC\_​PGA\_​49** | Student Login / Raise an Appeal | Verify student updates and re-submits appeal after Supervisor Send Back. 1\. Click Action. 2\. Update fields. 3\. Click Update. **Test Data:** Updated Category: FEE PAYMENT APPEAL; Updated Subject and Justification | System displays alert: "Updated Successfully." |  | **Pass** |
| **TC\_​PGA\_​50** | Student Login / Raise an Appeal | Verify status changes to Re-submitted after update. Check status. **Test Data:** Status: Re-submitted | Status changes to "Re-submitted". |  | **Pass** |
| **TC\_​PGA\_​51** | Student Login / Raise an Appeal | Verify Action button is disabled after re-submission. Check Action button. | Action button in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​52** | Student Login / Raise an Appeal | Verify re-submitted appeal returns to Trainer for review. Check Trainer login. | Re-submitted appeal forwarded to Trainer Appeal Review screen. |  | **Pass** |
| **TC\_​PGA\_​53** | Trainer Login / Appeal Review | Verify Trainer sees Re-submitted status. Check Trainer Appeal Review grid. **Test Data:** Status: Re-submitted | Status updated to "Re-submitted" in Trainer grid. |  | **Pass** |
| **TC\_​PGA\_​54** | Trainer Login / Appeal Review | Verify appeal details view shows updated student data. Trainer clicks Appeal Details View. **Test Data:** Updated Subject: Trainer Send Back Comments Not Displayed | Updated student details displayed correctly in appeal details screen. |  | **Pass** |
| **TC\_​PGA\_​55** | Trainer Login / Appeal Review | Verify Recommend and Send Back buttons enabled after re-submission. Check action button states. | Recommend and Send Back buttons displayed in enabled mode. |  | **Pass** |
| **TC\_​PGA\_​56** | Trainer Login / Appeal Review | Verify Recommend without comments is rejected. 1\. Click Recommend. 2\. Leave comments blank. 3\. Click Save. **Test Data:** Comments: \[blank\] | System displays alert: "Please enter comments." |  | **Pass** |
| **TC\_​PGA\_​57** | Trainer Login / Appeal Review | Verify trainer recommends student appeal. 1\. Click Recommend. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: Trainer recommends student appeal form | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​58** | Trainer Login / Appeal Review | Verify status changes to Supervisor Approved after recommend. Check status. **Test Data:** Status: Supervisor Approved | Status changes to "Supervisor Approved". |  | **Pass** |
| **TC\_​PGA\_​59** | Trainer Login / Appeal Review | Verify Recommend and Send Back buttons disabled after recommendation. Check action buttons. | Recommend and Send Back buttons in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​60** | Trainer Login / Appeal Review | Verify Supervisor Approved status propagates to student login. Check student raise appeal screen status. **Test Data:** Status: Supervisor Approved | Status updated to "Supervisor Approved" in student login. |  | **Pass** |
| **TC\_​PGA\_​61** | Trainer Login / Appeal Review | Verify search functionality. Enter status in search box. **Test Data:** Status: Supervisor Approved | Matching record displayed in grid. |  | **Pass** |
| **TC\_​PGA\_​62** | Trainer Login / Appeal Review | Verify pagination. Admin clicks on page 2\. | System navigates to second page successfully. |  | **Pass** |
| **TC\_​PGA\_​63** | Trainer Login / Appeal Review | Verify recommended appeal is forwarded to HOD. Check HOD login appeal review screen. | Appeal review record sent to HOD login for further processing. |  | **Pass** |

## **Group 17: PG Appeal – HOD Login: Appeal Review by HOD (36 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​64** | HOD Login / Appeal Review by HOD | Verify HOD sees Supervisor Approved record in grid. HOD opens Appeal Review by HOD screen. **Test Data:** Status: Supervisor Approved | Appeal record displayed with status "Supervisor Approved" in grid. |  | **Pass** |
| **TC\_​PGA\_​65** | HOD Login / Appeal Review by HOD | Verify appeal details view shows student data. HOD clicks Appeal Details View. **Test Data:** Student: SUJAY W; Category: FEE PAYMENT APPEAL | Student details displayed correctly in appeal details screen. |  | **Pass** |
| **TC\_​PGA\_​66** | HOD Login / Appeal Review by HOD | Verify BOE Verdict section. HOD clicks BOE Verdict button. **Test Data:** Thesis Marks: 42/70; Viva Marks: 25/30 | BOE verdict details displayed correctly. |  | **Pass** |
| **TC\_​PGA\_​67** | HOD Login / Appeal Review by HOD | Verify supporting documents view. HOD clicks Supporting Documents View. | Supporting document file opens successfully. |  | **Pass** |
| **TC\_​PGA\_​68** | HOD Login / Appeal Review by HOD | Verify comments view shows trainer recommend comments. HOD clicks Comments View. **Test Data:** Role: Trainer; Comments: Trainer recommends student appeal form | Trainer recommends comments displayed in view comments screen. |  | **Pass** |
| **TC\_​PGA\_​69** | HOD Login / Appeal Review by HOD | Verify HOD sends back to Supervisor. 1\. Select Send Back to Supervisor from dropdown. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: HOD send back student appeal form to supervisor for reviewing. | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​70** | HOD Login / Appeal Review by HOD | Verify action dropdown disabled after HOD send back. Check action dropdown state. | Action dropdown disabled after send back action. |  | **Pass** |
| **TC\_​PGA\_​71** | HOD Login / Appeal Review by HOD | Verify status changes to HOD Sent Back. Check status. **Test Data:** Status: HOD Sent Back | Status changes to "HOD Sent Back". |  | **Pass** |
| **TC\_​PGA\_​72** | HOD Login / Appeal Review by HOD | Verify HOD Sent Back status propagates to Trainer screen. Check Trainer login. **Test Data:** Status: HOD Sent Back | Status updated to "HOD Sent Back" in Trainer login. |  | **Pass** |
| **TC\_​PGA\_​73** | HOD Login / Appeal Review by HOD | Verify HOD Sent Back status propagates to Student screen. Check Student login. **Test Data:** Status: HOD Sent Back | Status updated to "HOD Sent Back" in Student login. |  | **Pass** |
| **TC\_​PGA\_​74** | HOD Login / Appeal Review by HOD | Verify appeal returns to Trainer for re-review. Check Trainer login. | Appeal review record sent back to Trainer login for further review. |  | **Pass** |
| **TC\_​PGA\_​75** | HOD Login / Appeal Review by HOD | Verify Recommend and Send Back re-enabled for Trainer. Check Trainer login action buttons. | Recommend and Send Back buttons enabled in Trainer login. |  | **Pass** |
| **TC\_​PGA\_​76** | Trainer Login / Appeal Review | Verify Trainer recommends after HOD send back. 1\. Click Recommend. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: Trainer recommends student appeal form | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​77** | Trainer Login / Appeal Review | Verify status returns to Supervisor Approved. Check status. **Test Data:** Status: Supervisor Approved | Status changes to "Supervisor Approved". |  | **Pass** |
| **TC\_​PGA\_​78** | Trainer Login / Appeal Review | Verify action buttons disabled after Trainer recommendation. Check buttons. | Recommend and Send Back buttons in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​79** | Trainer Login / Appeal Review | Verify Supervisor Approved status propagates to student. Check student login. **Test Data:** Status: Supervisor Approved | Status updated to "Supervisor Approved" in student login. |  | **Pass** |
| **TC\_​PGA\_​80** | HOD Login / Appeal Review by HOD | Verify HOD sees re-recommended Supervisor Approved record. HOD opens Appeal Review screen. **Test Data:** Status: Supervisor Approved | Record displayed with "Supervisor Approved" status. |  | **Pass** |
| **TC\_​PGA\_​81** | HOD Login / Appeal Review by HOD | Verify HOD dismisses (rejects) student appeal. 1\. Select Dismiss Appeal from dropdown. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: HOD rejected student appeal form. | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​82** | HOD Login / Appeal Review by HOD | Verify HOD rejection comments visible in screen. HOD clicks Comments View. **Test Data:** Role: HOD; Comments: HOD rejected student appeal form | HOD rejection comments displayed in screen. |  | **Pass** |
| **TC\_​PGA\_​83** | HOD Login / Appeal Review by HOD | Verify status changes to HOD Rejected. Check status. **Test Data:** Status: HOD Rejected | Status changes to "HOD Rejected". |  | **Pass** |
| **TC\_​PGA\_​84** | HOD Login / Appeal Review by HOD | Verify HOD Rejected status propagates to Trainer screen. Check Trainer login. **Test Data:** Status: HOD Rejected | Status updated to "HOD Rejected" in Trainer login. |  | **Pass** |
| **TC\_​PGA\_​85** | HOD Login / Appeal Review by HOD | Verify HOD Rejected status propagates to Student screen. Check Student login. **Test Data:** Status: HOD Rejected | Status updated to "HOD Rejected" in Student login. |  | **Pass** |
| **TC\_​PGA\_​86** | HOD Login / Appeal Review by HOD | Verify search functionality. Enter status in search box. **Test Data:** Status: HOD Rejected | Matching record displayed in grid. |  | **Pass** |
| **TC\_​PGA\_​87** | HOD Login / Appeal Review by HOD | Verify pagination. Admin clicks on page 2\. | System navigates to second page successfully. |  | **Pass** |
| **TC\_​PGA\_​88** | HOD Login / Appeal Review by HOD | Verify student can submit new appeal after HOD rejection. Check student login Add button. | System allows student to submit another raise appeal record. |  | **Pass** |
| **TC\_​PGA\_​89** | Student Login / Raise an Appeal | Verify student submits new appeal after HOD rejection. 1\. Click Add. 2\. Fill all fields. 3\. Click Submit. **Test Data:** New appeal submission | Appeal form successfully sent to Trainer Appeal Review screen. |  | **Pass** |
| **TC\_​PGA\_​90** | Trainer Login / Appeal Review | Verify Trainer recommends new appeal. 1\. Click Recommend. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: Trainer recommends student appeal form | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​91** | Trainer Login / Appeal Review | Verify recommended appeal forwarded to HOD. Check HOD login. | Appeal sent to HOD login Appeal Review by HOD screen. |  | **Pass** |
| **TC\_​PGA\_​92** | HOD Login / Appeal Review by HOD | Verify HOD sees Supervisor Approved record. HOD opens Appeal Review screen. **Test Data:** Status: Supervisor Approved | Record displayed with "Supervisor Approved" status. |  | **Pass** |
| **TC\_​PGA\_​93** | HOD Login / Appeal Review by HOD | Verify HOD upholds (approves) student appeal. 1\. Select Uphold Appeal from dropdown. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: HOD approved student appeal form | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​94** | HOD Login / Appeal Review by HOD | Verify status changes to HOD Approved. Check status. **Test Data:** Status: HOD Approved | Status changes to "HOD Approved". |  | **Pass** |
| **TC\_​PGA\_​95** | HOD Login / Appeal Review by HOD | Verify action dropdown disabled after HOD approval. Check action dropdown. | Action dropdown displayed in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​96** | HOD Login / Appeal Review by HOD | Verify HOD Approved status propagates to Trainer screen. Check Trainer login. **Test Data:** Status: HOD Approved | Status updated to "HOD Approved" in Trainer login. |  | **Pass** |
| **TC\_​PGA\_​97** | HOD Login / Appeal Review by HOD | Verify HOD Approved status propagates to Student screen. Check Student login. **Test Data:** Status: HOD Approved | Status updated to "HOD Approved" in Student login. |  | **Pass** |
| **TC\_​PGA\_​98** | HOD Login / Appeal Review by HOD | Verify comments view shows HOD approved and Trainer recommended. HOD clicks Comments View. **Test Data:** Role: HOD \- HOD approved; Role: Trainer \- Trainer recommends | HOD approved and Trainer recommend comments displayed. |  | **Pass** |
| **TC\_​PGA\_​99** | HOD Login / Appeal Review by HOD | Verify HOD Approved appeal forwarded to Examiner BOE. Check Examiner login. | Upheld appeal record sent to Examiner login for further review. |  | **Pass** |

## **Group 18: PG Appeal – Examiner Login: Appeal Review BOE (54 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​100** | Examiner Login / Appeal Review BOE | Verify Examiner sees HOD Approved record in BOE grid. Examiner opens Appeal Review BOE screen. **Test Data:** Status: HOD Approved | BOE record displayed with status "HOD Approved". |  | **Pass** |
| **TC\_​PGA\_​101** | Examiner Login / Appeal Review BOE | Verify appeal details view. Examiner clicks Appeal Details View. | Student appeal form details displayed correctly. |  | **Pass** |
| **TC\_​PGA\_​102** | Examiner Login / Appeal Review BOE | Verify BOE Verdict section. Examiner clicks BOE Verdict button. **Test Data:** Thesis Marks: 42/70; Viva Marks: 25/30 | BOE verdict details displayed correctly. |  | **Pass** |
| **TC\_​PGA\_​103** | Examiner Login / Appeal Review BOE | Verify supporting documents view. Examiner clicks Supporting Documents View. | Supporting document opens successfully. |  | **Pass** |
| **TC\_​PGA\_​104** | Examiner Login / Appeal Review BOE | Verify comments view shows HOD, Trainer, and Examiner comments. Examiner clicks Comments View. **Test Data:** HOD: Approved; Trainer: Recommends; Examiner: BOE Rejected | All role comments displayed in comments screen. |  | **Pass** |
| **TC\_​PGA\_​105** | Examiner Login / Appeal Review BOE | Verify BOE rejects student appeal. 1\. Select Reject from action dropdown. 2\. Enter comments. 3\. Click Save. **Test Data:** Comments: BOE Rejected student appeal form. | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​106** | Examiner Login / Appeal Review BOE | Verify status changes to BOE Rejected. Check status. **Test Data:** Status: BOE Rejected | Status changes to "BOE Rejected". |  | **Pass** |
| **TC\_​PGA\_​107** | Examiner Login / Appeal Review BOE | Verify action dropdown disabled after BOE rejection. Check dropdown. | Action dropdown in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​108** | Examiner Login / Appeal Review BOE | Verify BOE Rejected status propagates to HOD screen. Check HOD login. **Test Data:** Status: BOE Rejected | Status updated to "BOE Rejected" in HOD login. |  | **Pass** |
| **TC\_​PGA\_​109** | Examiner Login / Appeal Review BOE | Verify BOE Rejected status propagates to Trainer screen. Check Trainer login. **Test Data:** Status: BOE Rejected | Status updated to "BOE Rejected" in Trainer login. |  | **Pass** |
| **TC\_​PGA\_​110** | Examiner Login / Appeal Review BOE | Verify BOE Rejected status propagates to Student screen. Check Student login. **Test Data:** Status: BOE Rejected | Status updated to "BOE Rejected" in Student login. |  | **Pass** |
| **TC\_​PGA\_​111** | Examiner Login / Appeal Review BOE | Verify student can submit new appeal after BOE rejection. Check student login. | System allows student to submit another raise appeal record. |  | **Pass** |
| **TC\_​PGA\_​112** | Student Login / Raise an Appeal | Verify student submits new appeal after BOE rejection. Student submits a new appeal form. **Test Data:** New appeal submission | Appeal forwarded to Trainer login for further review. |  | **Pass** |
| **TC\_​PGA\_​113** | Trainer Login / Appeal Review | Verify Trainer recommends appeal. Trainer recommends; enters comments; saves. **Test Data:** Comments: Trainer recommends | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​114** | Trainer Login / Appeal Review | Verify appeal forwarded to HOD. Check HOD login. | Appeal sent to HOD login for further review. |  | **Pass** |
| **TC\_​PGA\_​115** | HOD Login / Appeal Review by HOD | Verify HOD sees Supervisor Approved record. HOD opens the Appeal Review screen. **Test Data:** Status: Supervisor Approved | Record displayed with "Supervisor Approved" status. |  | **Pass** |
| **TC\_​PGA\_​116** | HOD Login / Appeal Review by HOD | Verify HOD upholds appeal. HOD selects Uphold Appeal; enters comments; saves. **Test Data:** Comments: HOD approved student appeal form | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​117** | HOD Login / Appeal Review by HOD | Verify status changes to HOD Approved. Check status. **Test Data:** Status: HOD Approved | Status changes to "HOD Approved". |  | **Pass** |
| **TC\_​PGA\_​118** | HOD Login / Appeal Review by HOD | Verify action dropdown disabled. Check dropdown. | Action dropdown in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​119** | HOD Login / Appeal Review by HOD | Verify HOD Approved status propagates to Trainer. Check Trainer login. **Test Data:** Status: HOD Approved | Status updated to "HOD Approved" in Trainer login. |  | **Pass** |
| **TC\_​PGA\_​120** | HOD Login / Appeal Review by HOD | Verify HOD Approved status propagates to Student. Check Student login. **Test Data:** Status: HOD Approved | Status updated to "HOD Approved" in Student login. |  | **Pass** |
| **TC\_​PGA\_​121** | HOD Login / Appeal Review by HOD | Verify comments view. HOD clicks Comments View. **Test Data:** HOD: Approved; Trainer: Recommends | HOD and Trainer comments displayed. |  | **Pass** |
| **TC\_​PGA\_​122** | HOD Login / Appeal Review by HOD | Verify upheld appeal forwarded to Examiner BOE. Check Examiner login. | Upheld appeal forwarded to Examiner BOE screen. |  | **Pass** |
| **TC\_​PGA\_​123** | Examiner Login / Appeal Review BOE | Verify BOE partially approves appeal. 1\. Select Partially Uphold from dropdown. 2\. Enter comments, Thesis marks, Viva marks. 3\. Click Save. **Test Data:** Thesis Marks: 42/70; Viva Marks: 25/30 | System displays alert: "Reviewed Successfully." |  | **Pass** |
| **TC\_​PGA\_​124** | Examiner Login / Appeal Review BOE | Verify status changes to BOE Partially Approved. Check status. **Test Data:** Status: BOE Partially Approved | Status changes to "BOE Partially Approved". |  | **Pass** |
| **TC\_​PGA\_​125** | Examiner Login / Appeal Review BOE | Verify action dropdown disabled after partial approval. Check dropdown. | Action dropdown in disabled mode. |  | **Pass** |
| **TC\_​PGA\_​126** | Examiner Login / Appeal Review BOE | Verify comments view shows all role comments. Examiner clicks Comments View. **Test Data:** HOD, Trainer, Examiner (partially approved) | All role comments displayed correctly. |  | **Pass** |
| **TC\_​PGA\_​127** | Examiner Login / Appeal Review BOE | Verify BOE Partially Approved propagates to HOD screen. Check HOD login. **Test Data:** Status: BOE Partially Approved | Status updated in HOD login. |  | **Pass** |
| **TC\_​PGA\_​128** | Examiner Login / Appeal Review BOE | Verify BOE Partially Approved propagates to Trainer screen. Check Trainer login. **Test Data:** Status: BOE Partially Approved | Status updated in Trainer login. |  | **Pass** |
| **TC\_​PGA\_​129** | Examiner Login / Appeal Review BOE | Verify BOE Partially Approved propagates to Student screen. Check Student login. **Test Data:** Status: BOE Partially Approved | Status updated in Student login. |  | **Pass** |
| **TC\_​PGA\_​130** | Examiner Login / Appeal Review BOE | Verify Final Outcome button enabled for students. Check student login raise appeal screen. | Final Outcome button enabled in student login. |  | **Pass** |
| **TC\_​PGA\_​131** | Student Login / Raise an Appeal | Verify student views BOE Partially Approved final outcome. Student clicks Final Outcome button. **Test Data:** Thesis Marks: 42/70; Viva Marks: 25/30 | BOE Partially Approved comments, thesis marks, and viva marks displayed. |  | **Pass** |
| **TC\_​PGA\_​132** | Student Login / Raise an Appeal | Verify student can submit new appeal after partial approval. Check student login. | System allows student to submit another appeal. |  | **Pass** |
| **TC\_​PGA\_​133-152** \[20 cases\] | Full Workflow — HOD Path, BOE Approved | Verify complete workflow: Student submits → Trainer recommends → HOD upholds → BOE Approves (full approval). Execute full appeal workflow through all roles. BOE selects Approve from dropdown and enters marks. **Test Data:** Thesis Marks: 42/70; Viva Marks: 25/30 | Each status transition is correct across all role screens. Final status is BOE Approved. Final Outcome button enabled. Student views BOE Approved outcome. |  | **Pass** |
| **TC\_​PGA\_​153** | Examiner Login / Appeal Review BOE | Verify further appeal submission is blocked after BOE Approval. Student attempts to add new appeal after BOE Approved. | System displays error: "Appeal request already submitted." |  | **Pass** |

## **Group 19: PG Appeal – Dean Login: Appeal Review by Dean (106 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​154-196** \[43 cases\] | Dean Path — Setup (Trainer → HOD → Dean) | Verify complete workflow up to Dean level: Student submits → Trainer recommends → HOD refers to Dean. Student submits new appeal. Trainer recommends. HOD selects Refer to Dean from dropdown. **Test Data:** New appeal submission; HOD Comments: HOD send student appeal to dean for reviewing. | Appeal correctly forwarded to Dean login with status HOD Referred to Dean. |  | **Pass** |
| **TC\_​PGA\_​197-214** \[18 cases\] | Dean Login / Appeal Review by Dean | Verify Dean appeal review actions: Details view, BOE Verdict, Request Additional Documents, Dismiss Appeal, Uphold Appeal, Refer to GS. Dean reviews appeal and exercises each available action in turn across separate test scenarios. **Test Data:** Statuses tested: Dean Requested Documents, Dean Rejected, Dean Approved, Dean Referred to GS | All Dean actions produce correct status transitions across all role screens (Student, Trainer, HOD, Examiner). Each action confirmation popup displays correctly. |  | **Pass** |
| **TC\_​PGA\_​215-259** \[45 cases\] | Examiner Login / Appeal Review BOE (Dean Path) | Verify BOE review of Dean-approved appeals: Reject, Partially Uphold, and Approve outcomes. Dean upholds appeal. Examiner exercises each BOE action: Reject, Partially Uphold, Approve. **Test Data:** BOE outcomes: BOE Rejected, BOE Partially Approved, BOE Approved | All BOE outcome statuses propagate correctly to Dean, HOD, Trainer, and Student screens. Final Outcome button enabled and displays correct marks for Partially Approved and Approved outcomes. |  | **Pass** |

## **Group 20: PG Appeal – GS Admin Login: Appeal Review GS (143 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​260-305** \[46 cases\] | GS Admin Login / Appeal Review GS — Setup and Core Actions | Verify GS Admin receives Dean Referred to GS record and exercises GS actions: Request Additional Documents, Dismiss Appeal, Partially Uphold, Uphold (Approve). Dean refers to GS. GS Admin opens Appeal Review GS screen and exercises each action in separate test scenarios. **Test Data:** Statuses tested: GS Requested Documents, GS Rejected, GS Partially Approved, GS Approved | All GS Admin actions produce correct status transitions. Status propagates to Dean, HOD, Trainer, and Student screens. Search and pagination functional. |  | **Pass** |
| **TC\_​PGA\_​306-402** \[97 cases\] | Examiner Login / Appeal Review BOE (GS Path) | Verify BOE review of GS-approved and GS-partially-approved appeals: Reject, Partially Uphold, and Approve outcomes. GS approves or partially approves. Examiner exercises each BOE action across multiple test paths. **Test Data:** BOE outcomes following GS Partially Approved and GS Approved: BOE Rejected, BOE Partially Approved, BOE Approved | All BOE outcome statuses propagate correctly to GS Admin, Dean, HOD, Trainer, and Student screens. Final Outcome button and marks display correctly for applicable BOE outcomes. |  | **Pass** |

## **Group 21: PG Appeal – Trainer Login: Appeal Panel Review (171 Test Cases)**

| Test Case ID | Module / Submodule | Test Scenario | Expected Result | Actual Result | UAT Status |
| :---: | ----- | ----- | ----- | ----- | :---: |
| **TC\_​PGA\_​403-517** \[115 cases\] | GS Admin Login — Panel Assignment Setup | Verify GS Admin assigns a panel trainer after Dean Referred to GS, and appeal is forwarded to Appeal Panel Review screen. 1\. Student submits appeal. 2\. Trainer recommends. 3\. HOD refers to Dean. 4\. Dean refers to GS. 5\. GS Admin selects panel trainer from dropdown. 6\. Clicks Save. **Test Data:** Panel Trainer: AKHIL TRAINER; Status: GS Panel Assigned | Status changes to GS Panel Assigned across all role screens. Appeal forwarded to Trainer login Appeal Panel Review screen. |  | **Pass** |
| **TC\_​PGA\_​518-532** \[15 cases\] | Trainer Login / Appeal Panel Review — Request Additional Evidence | Verify Trainer in panel review can request additional evidence, disabling their action dropdown and returning the record to GS Admin for reassignment. 1\. Trainer opens Appeal Panel Review screen. 2\. Views Appeal Details, BOE Verdict, documents, and comments. 3\. Selects Request Additional Evidence from dropdown. 4\. Enters comments and saves. **Test Data:** Comments: Trainer requests additional evidence; Status: Panel Requested Evidence | Status changes to Panel Requested Evidence across all role screens. Action dropdown disabled for Trainer. GS Admin action dropdown re-enabled for reassignment. |  | **Pass** |
| **TC\_​PGA\_​533-563** \[31 cases\] | Trainer Login / Appeal Panel Review — Schedule Hearing | Verify Trainer can schedule a hearing with date, meeting link, and remarks after panel reassignment. Student can join meeting from their screen. 1\. GS Admin reassigns panel. 2\. Trainer selects Schedule Hearing from dropdown. 3\. Enters Hearing Date, Google Meet link, and Remarks. 4\. Clicks Save. 5\. Student clicks Join Meeting button. **Test Data:** Hearing Date: 04-06-2026; Meeting Link: https\://meet.google.com/xyb-ksmx-wsc; Status: Panel Hearing Scheduled | Status changes to Panel Hearing Scheduled. Meeting Details button enabled on student screen with correct date and join link. Join button opens Google Meet in new tab. |  | **Pass** |
| **TC\_​PGA\_​564-572** \[9 cases\] | Trainer Login / Appeal Panel Review — Review and Approve | Verify Trainer can review and approve appeal after hearing, with Panel Approved status propagating across all screens. Further appeal submission blocked. 1\. Trainer selects Review and Approve from dropdown. 2\. Enters comments. 3\. Clicks Save. **Test Data:** Comments: Trainer reviewed & approved student appeal record; Status: Panel Approved | Status changes to Panel Approved across all role screens (GS Admin, Dean, HOD, Trainer, Student). Further appeal submission blocked with appropriate error message. |  | **Pass** |
| **TC\_​PGA\_​573** | Admin Login / PG Appeal Period Setup | Verify system blocks appeal submission after appeal period end date. Student attempts to submit new appeal after appeal period end date. **Test Data:** Appeal period end date reached | System displays alert: "Appeal Period Closed" and prevents further submission. |  | **Pass** |

# **Backlog Management Index**

| No. | Issue Name | Description |
| :---: | ----- | ----- |
| **BM-001** | Failed Validation Test Cases Awaiting Confirmation | TC\_PG\_68 (missing Research Title validation) and TC\_PG\_77 (missing proposal PDF validation) are recorded as Fail in the source UAT sheet, although their remarks read "confirmed" and the source summary reported a 100% pass rate. Confirm the outcome, fix and retest if a defect exists, or correct the recorded status. Group 4 is reported as Conditional until resolved. |
| **BM-002** | UAT Status Not Recorded for Appeal Period Setup | No Pass/Fail result is recorded for TC\_PGA\_01 to TC\_PGA\_05 (create, grid display, open update screen, update, grid refresh). The source group range is TC\_PGA\_01 – TC\_PGA\_09 but no TC\_PGA\_09 was supplied. Group 13 is reported as Conditional until statuses are confirmed. |
| **BM-003** | Duplicate Test Case ID TC\_PG\_70 | TC\_PG\_70 is used for two different cases: the negative invalid-file-type check in Group 4 and the positive student resubmission after Second Supervisor send-back in Group 5\. Renumber one of them to remove ambiguity in QA records. |
| **BM-004** | Non-Sequential Test Case Numbering and Count Mismatch | PG Research test case IDs skip the following numbers: TC\_PG\_71–76, 79–89, 92–93, 95–111, 114, 127, 130–131, 135, 138–143, 145–149, 156–158, 164, 170–173, 184, 189 and 193\. The source summary declared 143 test cases (Groups 4, 5 and 7 declared 26, 10 and 6), whereas 140 are listed (25, 9 and 5). Confirm whether the missing cases were executed and supply them, or renumber the sequence. |
| **BM-005** | Test Case ID Prefix Typos | TG\_PG\_01, TG\_PG\_17, TG\_PG\_134, TG\_PG\_136 and TG\_PG\_197 used the prefix "TG\_PG" in the source document; these have been normalised to "TC\_PG" in this document. Update the source UAT sheet accordingly. |
| **BM-006** | Actor Mislabelled in Test Case Metadata | TC\_PG\_77 is filed under First Supervisor login although the step is a Student action (Submit for Review without a PDF). TC\_PGA\_35 (Student Login), TC\_PGA\_62 (Trainer Login) and TC\_PGA\_87 (HOD Login) are pagination cases whose step reads "Admin clicks on page 2". Correct the login/role in the source. |
| **BM-007** | Inconsistent Notification Wording | Success messages vary across the modules, e.g. "Feedback submitted successfully." (TC\_PG\_24, 38, 48\) vs "Feedback submitted successfully\!" (TC\_PG\_60); "Approved successfully." (TC\_PG\_122, 128\) vs "Defence Request Date Approved Successfully." (TC\_PG\_133); "Created Successfully." vs "Created successfully." (TC\_PGA\_01 vs TC\_PGA\_10); and "Created Successfully." is shown when an appeal is submitted from draft (TC\_PGA\_27). Standardise wording and action labels. |
| **BM-008** | Consolidated Range Rows in Appeal Test Cases | Ten PG Appeal rows in Groups 18 to 21 are recorded in the source as single consolidated entries covering a range of test case IDs (TC\_PGA\_133-152, 154-196, 197-214, 215-259, 260-305, 306-402, 403-517, 518-532, 533-563 and 564-572; 466 cases in total). Individual steps, test data and results per case were not supplied. Provide the itemised cases so each can be traced and signed off. |

# **Tester Approval / Sign-off**

Once all test cases yield a Pass result, or acceptable workarounds have been agreed upon, this document shall be signed off by the following representatives to confirm formal acceptance of the PG Research Management and PG Appeal Management modules for production deployment.

| No | Name | Designation | Date | Signature |
| :---- | :---- | :---- | :---- | :---- |
| 1\. | Yvonne Maua | Project Lead \-KOTDA |  |  |
| 2\. | Amos Wanyoike | ICT Director |  |  |
| 3\. |  | Lead User  |  |  |
| 4\. |  | Business Analyst |  |  |
| 5\. |  | Technical Lead – OUK |  |  |
| 6\. |  | Technical Lead – KOTDA |  |  |
| 7\. |  | Delivery Management – Dhanush |  |  |

