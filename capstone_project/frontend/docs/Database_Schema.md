# Database Schema

## Job Portal with Employer Dashboard

### 1. Users

* `user_id` – Primary Key
* `name`
* `email`
* `password`
* `role`

### 2. Candidates

* `candidate_id` – Primary Key
* `user_id` – Foreign Key
* `qualification`
* `experience`
* `resume`

### 3. Employers

* `employer_id` – Primary Key
* `user_id` – Foreign Key
* `company_name`
* `company_description`

### 4. Jobs

* `job_id` – Primary Key
* `employer_id` – Foreign Key
* `title`
* `description`
* `location`
* `salary`
* `experience_required`
* `status`

### 5. Applications

* `application_id` – Primary Key
* `job_id` – Foreign Key
* `candidate_id` – Foreign Key
* `applied_date`
* `status`

### 6. Skills

* `skill_id` – Primary Key
* `skill_name`

### 7. Candidate_Skills

* `candidate_id` – Foreign Key
* `skill_id` – Foreign Key
* Composite Primary Key: `candidate_id + skill_id`

### 8. Job_Skills

* `job_id` – Foreign Key
* `skill_id` – Foreign Key
* Composite Primary Key: `job_id + skill_id`

## Relationships

* One User can have one Candidate profile.
* One User can have one Employer profile.
* One Employer can post many Jobs.
* One Candidate can submit many Applications.
* One Job can receive many Applications.
* Candidates can have multiple Skills.
* Jobs can require multiple Skills.
* Candidate skills and job skills are used for candidate-employer matching.
