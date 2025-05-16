
# ShowBiz Booking Event 🎭

### Use Case Diagram

![Project Relational Schema](https://github.com/SUMMER2024-SWP391/ShowBiz_Booking_Event_BE/blob/main/imgs/relational_schema.png)

## Overview 🌟

ShowBiz Booking Event is a comprehensive event and seminar registration system designed specifically for educational institutions. The platform streamlines the management of academic events, seminars, and conferences, providing robust tools for event creation, ticketing, registration, payment processing, check-in, and post-event feedback collection.

## Purpose 🎯

This system addresses common challenges faced by event organizers in educational settings:

- Efficient event registration and fee collection
- Streamlined check-in processes
- Simplified event promotion and attendee management
- Data collection for sponsors and stakeholders
- Post-event feedback collection and analytics

## Key Features ✨

### For Visitors/Attendees 👥
- Browse and view public events
- Register for events with FPT email verification
- Electronic ticket system with QR codes
- Online payment options (VNPay, PayPal)
- Personal event dashboard
- Subscribe to event operators
- Post-event feedback submission
- Point accumulation system based on event participation

### For Event Operators 📋
- Create and manage events
- Customizable registration forms
- Public and private event options
- Approval-based registration workflow
- Real-time statistics on attendance
- Check-in staff management
- Post-event survey creation
- Export attendee and check-in data

### For Administrators 👑
- Event approval workflow
- Event operator account management
- System-wide analytics
- Emergency event cancellation
- Platform management

### For Checking Staff 🔍
- Manual check-in via student/faculty ID
- Registration form response viewing
- Survey management

## Technical Overview 🔧

### Authentication & Authorization 🔐
- Multi-role system (Guest, Visitor, Event Operator, Checking Staff, Admin)
- Role-based permissions and access control

### Event Management 📅
- Configurable events (capacity, approval requirements, pricing)
- Edit restrictions based on event state and admin approval
- Pre-event validation (timing, capacity, etc.)

### Payment Integration 💰
- Online payment processing (ZaloPay)

### Check-in System 📲
- Student/Faculty ID verification
- Check Ticket information

### Communication 📧
- Automated email notifications
- Participant updates for event changes

### Analytics 📊
- Attendance tracking and reporting
- Feedback collection and analysis
- Demographic data collection (age, location)

### Special Features 🌟
- Points system for event participation
- Venue conflict management
- Sponsor and speaker information tracking

## System Workflows 🔄

### Event Creation 🆕
1. Event operator creates event with required details
2. Admin approves or declines event
3. System notifies sponsors and speakers
4. Event becomes visible to potential attendees

### Event Registration ✍️
1. Visitor browses events and selects registration
2. System validates capacity availability
3. Visitor completes registration form
4. Payment processed (if applicable)
5. QR ticket generated and sent to visitor

### Event Check-in 🎟️
1. Attendee presents QR code at event
2. Checking staff scans QR or searches by ID
3. System validates and records attendance

### Feedback Collection 📝
1. System distributes post-event surveys
2. Attendees submit feedback
3. Operators analyze response data

## Development Guidelines 📋

- Implement capacity checks before payment processing
- Handle concurrent registrations to prevent overbooking
- Restrict event edits after admin approval and registrations
- Enable cancellations with automatic refund processing
- Provide data export in Excel format for operators and admins
- Implement points system for attendee engagement

## Team Members

| Name                    	| RollNum      	| Role      	| Position                      	|
|-------------------------	|------------	|------------	|-------------------------------	|
| [**Nguyễn Việt Hoàng**](https://github.com/hoangday185) 	| **SE16xxxx** 	| **Mern Stack** 	| **Leader Frontend** 	|
| [**Nguyễn Lê Phương Nam**](https://github.com/HenryDev1553) | **SE171111** 	| **Frontend** 	| **Member**                    	|
| [**Mai Minh Nhật**](https://github.com/minatisleeping)  	| **SE161567** 	| **Backend** 	| **Leader Backend**                    	|
| [**Nguyễn Anh Huy**](https://github.com/kle1603)        	| **SE171255** 	| **Backend** | **Member**           	|
