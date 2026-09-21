                                 Problem Statement

## 1. Title

Smart Job Portal with Employer Dashboard

## 2. Domain

Employment and Recruitment

## 3. Who is the User?

The system has two main user types:

1. Job Seeker
2. Employer

### Job Seeker

A job seeker can register, create a profile, search for jobs, apply for suitable jobs, and track application status.

### Employer

An employer can register, create a company profile, post job vacancies, manage job postings, view applicants, and update application statuses.

## 4. What Problem Are We Solving?

Job seekers often find it difficult to search for suitable jobs and track multiple job applications in one place.
Employers may struggle to manage job postings and handle a large number of applicants efficiently.
Applicants may not receive clear updates about whether their applications are shortlisted or rejected.
Managing job vacancies and candidate information manually can be time-consuming for employers.
The proposed Job Portal provides a centralized platform to simplify job searching, applications, and applicant management.

## 5. Proposed Solution

The proposed system will provide:

- User registration and login
- Role-based access control
- Job seeker profile management
- Employer/company profile management
- Job posting and management
- Job search and filtering
- Online job application
- Application tracking
- Employer applicant dashboard
- Candidate shortlisting and rejection
- Application status updates
- Email notifications
- AI-based job recommendations as an enhancement feature

## 6. Core Entities / Database Tables

The main database tables are:

1. Users
2. JobSeekers
3. Employers
4. Jobs
5. Applications
6. Skills

The main relationships are:

- One Employer can create many Jobs.
- One Job can receive many Applications.
- One Job Seeker can submit many Applications.
- Users are associated with either a Job Seeker or Employer role.
- Job Seekers can have multiple Skills.

## 7. User Roles and Permissions

### Job Seeker

- Register and login
- Manage profile
- Add skills and qualifications
- Search jobs
- View job details
- Apply for jobs
- Track applications
- View application status

### Employer

- Register and login
- Manage company profile
- Post jobs
- Edit jobs
- Delete jobs
- View posted jobs
- View applicants
- Shortlist candidates
- Reject candidates
- Update application status

## 8. Success Criteria

A job seeker should be able to search for a suitable job and submit an application within 1 minute.
An employer should be able to post a new job vacancy within 2 minutes.
A job seeker should be able to view their application status easily from the dashboard.
An employer should be able to view and update applicant status from the employer dashboard.

## 9. Out of Scope

- Online payment or salary processing.
- Video interviews or video calling.
- Real-time chat between employers and job seekers.
- Mobile application development.
- Employee attendance and payroll management.
- Background verification of candidates.
- Automatic hiring or recruitment decisions.
- Integration with external job portals such as LinkedIn or Indeed.
- Advanced AI interview assessment.
- Resume generation or resume designing.

## 10. Chosen Track

Java (Spring boot)
