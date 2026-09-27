# Class Waitlist SMS Notification Job (Twilio Mock) - Architecture Blueprint

**Ticket ID:** ENG-135180  
**Epic:** Core Infrastructure Overhaul  
**Reporter:** Amit Sharma (Senior Staff Engineer)  
**Author:** Nisha Sharma  

---

## 1. Entity Relationship Diagram (ERD) & Database Schema

### 1.1 `fitness_classes` Table
Stores gym and academy fitness classes managed by floor staff.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `class_id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique class identifier |
| `name` | VARCHAR(100) | NOT NULL | Name of the class (e.g., Yoga Fusion) |
| `schedule_time` | VARCHAR(100) | NOT NULL | Class schedule time slot |
| `instructor` | VARCHAR(100) | NOT NULL | Primary instructor name |
| `capacity` | INTEGER | NOT NULL, CHECK (capacity > 0) | Maximum room capacity |
| `enrolled_count` | INTEGER | NOT NULL DEFAULT 0 | Current enrolled member count |
| `room` | VARCHAR(50) | NOT NULL | Room / Studio location |
| `category` | VARCHAR(50) | NOT NULL | Class category (Cardio, HIIT, Yoga) |
| `created_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

### 1.2 `waitlist_entries` Table
Stores students waiting for open spots in a fitness class.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `entry_id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique waitlist entry ID |
| `class_id` | UUID | REFERENCES fitness_classes(class_id) | Target class foreign key |
| `student_name` | VARCHAR(150) | NOT NULL | Student full name (Sanitized) |
| `phone_number` | VARCHAR(20) | NOT NULL | Phone number in E.164 format |
| `email` | VARCHAR(150) | NULL | Optional student email |
| `position` | INTEGER | NOT NULL | Current queue position (1, 2, 3...) |
| `status` | ENUM | 'WAITING', 'NOTIFIED', 'CLAIMED', 'EXPIRED' | Queue status |
| `priority_tier` | ENUM | 'Standard', 'Member', 'VIP' | Priority queue status |
| `notes` | TEXT | NULL | Floor staff notes |
| `date_added` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Date added to waitlist |
| `last_notified_at` | TIMESTAMPTZ | NULL | Timestamp of last SMS dispatch |

**Index Strategy:**
- Compound Index `idx_waitlist_class_pos ON waitlist_entries (class_id, position)` to optimize queue ordering queries.

---

### 1.3 `sms_notification_jobs` Table (Twilio Log)
Tracks outbound Twilio SMS notification jobs.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `job_id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique SMS job identifier |
| `entry_id` | UUID | REFERENCES waitlist_entries(entry_id) | Associated waitlist record |
| `message_sid` | VARCHAR(34) | UNIQUE, NOT NULL | Twilio Message SID (`SM...`) |
| `from_phone` | VARCHAR(20) | NOT NULL | Twilio sender phone number |
| `to_phone` | VARCHAR(20) | NOT NULL | Recipient student phone number |
| `body` | TEXT | NOT NULL | Message body text |
| `status` | ENUM | 'queued', 'sending', 'delivered', 'failed' | Delivery status |
| `error_code` | INTEGER | NULL | Twilio error code (e.g., 21211) |
| `error_message` | TEXT | NULL | Detailed Twilio error string |
| `dispatched_at` | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Dispatch timestamp |

---

## 2. REST API Contracts

### 2.1 Add Student to Waitlist
- **Endpoint:** `POST /api/v1/waitlist/entries`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "classId": "c-1",
  "studentName": "Sarah Connor",
  "phoneNumber": "+14155550199",
  "email": "sarah@example.com",
  "priority": "VIP",
  "notes": "Front row mat"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "entryId": "w-101",
    "position": 1,
    "status": "WAITING",
    "createdAt": "2026-09-27T21:30:00Z"
  }
}
```

### 2.2 Trigger Twilio SMS Notification Job
- **Endpoint:** `POST /api/v1/jobs/twilio-sms/dispatch`
- **Request Body:**
```json
{
  "entryId": "w-101",
  "mode": "SUCCESS"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "messageSid": "SM8f9210c44a9821e902a7719d0831a29f",
  "status": "delivered",
  "expiryWindowMinutes": 15
}
```

---

## 3. Security & Telemetry
1. **XSS Input Sanitization:** All text inputs stripped of HTML `<script>` tags and `javascript:` pseudoprotocols using regex sanitizer.
2. **Telemetry Pings:** Console logging adhering strictly to `[Analytics] User interacted with Class Waitlist SMS Notification Job (Twilio Mock)` format.
