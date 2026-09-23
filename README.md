# Workflow Application

A web-based **multi-step request management and approval workflow system** built with **Spring Boot 3.2.5**, **Java 21**, **MySQL**, and **JWT-based security**.

The application is designed to digitalize internal company requests, their validation process, approval steps, notifications, and document generation.

---

## 🚀 Technologies & Tools

### Backend

| Technology                   | Version / Usage                 |
| ---------------------------- | ------------------------------- |
| **Java**                     | 21                              |
| **Spring Boot**              | 3.2.5                           |
| **Spring Web**               | REST API                        |
| **Spring Data JPA**          | Database persistence            |
| **Hibernate**                | ORM                             |
| **Spring Security**          | Authentication & authorization  |
| **JWT (JJWT)**               | Token-based authentication      |
| **Spring Validation**        | Request/data validation         |
| **Spring Mail**              | Email notifications             |
| **MySQL**                    | Relational database             |
| **Lombok**                   | Reduce Java boilerplate         |
| **OpenPDF**                  | PDF generation                  |
| **Maven**                    | Dependency & project management |
| **JUnit / Spring Boot Test** | Testing                         |

### Development Tools

* **IntelliJ IDEA / VS Code**
* **Maven**
* **MySQL Workbench**
* **Git**
* **GitHub**
* **Postman** — API testing
* **Java JDK 21**

---

## 🏗️ Architecture

The backend follows a layered architecture:

```text
┌─────────────────────────────┐
│          Frontend           │
│      Angular / REST Client  │
└──────────────┬──────────────┘
               │ HTTP / JSON
               ▼
┌─────────────────────────────┐
│       Spring Boot API       │
├─────────────────────────────┤
│ Controllers                 │
│ Services                    │
│ Repositories                │
│ Security / JWT              │
│ Validation                  │
└──────────────┬──────────────┘
               │ JPA / Hibernate
               ▼
┌─────────────────────────────┐
│           MySQL             │
└─────────────────────────────┘

               │
               ├── Email Notifications
               │
               └── PDF Generation
```

---

## 🔐 Security

The application uses **Spring Security** with **JWT authentication**.

Main security features:

* JWT authentication
* BCrypt password hashing
* Role-based access control
* Protected REST endpoints
* Method-level authorization
* `@PreAuthorize`
* Authentication filters
* Secure password storage

Example:

```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> manageRequest() {
    // ...
}
```

---

## 👥 User Roles

The workflow system supports different user roles according to their responsibilities.

Example roles:

* **ADMIN**
* **DEPARTMENT_HEAD**
* **FACTORY_DIRECTOR**
* Other authorized workflow users

Employees who only submit requests do not necessarily need a traditional application account, depending on the configured workflow.

---

## 🔄 Workflow Management

The application manages requests through multiple stages.

Example workflow:

```text
Request Created
      │
      ▼
Department Validation
      │
      ▼
IT / Responsible Validation
      │
      ▼
Local Approval
      │
      ▼
External Approval
      │
      ▼
Final Approval
      │
      ▼
Completed
```

The workflow supports **sequential approval steps**, meaning a request must pass the current validation stage before moving to the next one.

---

## 📋 Request Types

The system can manage different types of requests, including:

* **ALTA** — New request
* **MODIFICACION** — Modification request
* **BAJA** — Deletion / deactivation request

Each request can contain its own workflow and approval history.

---

## 🏢 Departments

The application can support multiple departments, including:

* IT
* ACHAT
* HSE
* RH
* LOGISTIQUE
* MAINTENANCE
* QUALITÉ
* PRODUCTION
* FINANCE ET GESTION PROJET

---

## 📧 Email Notifications

The application uses:

**Spring Boot Starter Mail**

to send workflow notifications.

Possible notifications include:

* New request
* Request assigned
* Request awaiting approval
* Request approved
* Request rejected
* Workflow completed
* User notification

---

## 📄 PDF Generation

The application uses **OpenPDF 1.3.43** for generating PDF documents.

Possible generated documents:

* Request summaries
* Approval documents
* Workflow reports
* Request history
* Administrative documents

---

## 🗄️ Database

The application uses:

**MySQL**

with:

* Spring Data JPA
* Hibernate
* JPA entities
* Repositories
* Relationships between entities

Typical entities can include:

```text
User
Department
Request
RequestType
Workflow
WorkflowStep
Approval
Notification
AuditLog
```

---

## 📦 Project Structure

Recommended backend structure:

```text
workflow-backend/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── workflow/
│   │   │           ├── config/
│   │   │           ├── controller/
│   │   │           ├── dto/
│   │   │           ├── entity/
│   │   │           ├── exception/
│   │   │           ├── repository/
│   │   │           ├── security/
│   │   │           ├── service/
│   │   │           └── WorkflowBackendApplication.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── ...
│   │
│   └── test/
│
├── pom.xml
└── README.md
```

---

## ⚙️ Configuration

Create/configure:

```text
src/main/resources/application.properties
```

Example MySQL configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/workflow_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8080
```

For security and email configuration, use environment variables in production instead of committing passwords or secret keys to Git.

---

## ▶️ Running the Application

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/workflow-backend.git
```

### 2. Open the project

```bash
cd workflow-backend
```

### 3. Configure MySQL

Create the database:

```sql
CREATE DATABASE workflow_db;
```

### 4. Build the project

```bash
mvn clean install
```

### 5. Start the application

```bash
mvn spring-boot:run
```

The API will normally be available at:

```text
http://localhost:8080
```

---

## 🧪 Testing

Run all tests:

```bash
mvn test
```

The project uses:

* Spring Boot Test
* JUnit
* Spring Security Test

---

## 🔌 API

The backend exposes RESTful APIs consumed by the frontend.

Example structure:

```text
/api/auth
/api/users
/api/departments
/api/requests
/api/workflows
/api/approvals
/api/notifications
/api/reports
```

Example request:

```http
POST /api/requests
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

---

## 🛠️ Maven Commands

### Run application

```bash
mvn spring-boot:run
```

### Build

```bash
mvn clean package
```

### Run tests

```bash
mvn test
```

### Skip tests during build

```bash
mvn clean package -DskipTests
```

---

## 📌 Main Backend Dependencies

The project is based on the following main Spring Boot modules:

```xml
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-validation
spring-boot-starter-mail
spring-boot-starter-test
spring-security-test
```

Additional technologies:

```text
JJWT 0.12.5
MySQL Connector/J
Lombok
OpenPDF 1.3.43
Hibernate / JPA
Maven
Java 21
```

---

## 🎯 Project Objectives

The main objectives are:

* Digitalize internal company requests
* Replace manual request processes
* Implement controlled multi-step approvals
* Secure access using JWT
* Manage roles and permissions
* Track request history
* Send automatic notifications
* Generate PDF documents
* Maintain an audit trail
* Centralize workflow management

---

## 🔒 Production Recommendations

Before deploying the application to production:

* Use environment variables for passwords and secrets
* Use a strong JWT secret
* Disable unnecessary debug logging
* Configure HTTPS
* Use database backups
* Configure proper CORS rules
* Protect sensitive endpoints
* Use production email credentials
* Avoid committing `application.properties` containing secrets
* Configure database users with appropriate privileges

---

## 📜 License

This project is developed for internal workflow and request management purposes.
