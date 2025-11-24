# Privacy Policy

**Last Updated: November 24, 2025**

## Introduction

Welcome to PurpleGlass. We are committed to protecting your privacy and ensuring you have a positive experience when using our application. This Privacy Policy explains how we collect, use, store, and protect your personal information.

**Privacy-First Architecture:** PurpleGlass is designed with privacy at its core. All AI processing (Large Language Models and speech recognition) runs entirely in your web browser using client-side technology. Your notes and AI interactions never leave your device for AI processing.

## 1. Information We Collect

### 1.1 Information You Provide

- **Account Information:** When you register, we collect your email address, name, and password (stored as an encrypted hash).
- **Note Content:** The text, formatting, tags, and metadata of notes you create.
- **Files:** Images, audio recordings, videos, and other files you upload to your notes.

### 1.2 Automatically Collected Information

- **Usage Data:** Information about how you interact with PurpleGlass (e.g., features used, notes created).
- **Device Information:** Browser type, operating system, IP address for security purposes.
- **Authentication Data:** Login timestamps, session information, JWT tokens for authentication.

### 1.3 Information We Do NOT Collect

- **AI Processing Data:** All AI features (summarization, chat, transcription) run locally in your browser. We never receive or process your AI interactions on our servers.
- **AI Model Data:** AI models are downloaded directly to your browser from third-party CDNs and cached locally.

## 2. How We Use Your Information

We use your information for the following purposes:

### 2.1 Service Delivery

- Providing access to your notes across sessions
- Syncing your notes across devices
- Enabling file uploads and media embedding
- User authentication and authorization

### 2.2 Service Improvement

- Analyzing usage patterns to improve features
- Debugging and troubleshooting technical issues
- Understanding which features are most valuable

### 2.3 Security & Fraud Prevention

- Detecting and preventing unauthorized access
- Protecting against spam, abuse, and malicious activity
- Maintaining audit logs for security incidents

### 2.4 Legal Compliance

- Complying with applicable laws and regulations
- Responding to legal requests and preventing harm

## 3. Data Storage and Security

### 3.1 Where Your Data is Stored

- **Database:** User accounts and note content are stored in a PostgreSQL database
- **File Storage:** Uploaded files are stored on Vercel Blob Storage with private access
- **AI Models:** Downloaded and cached in your browser's IndexedDB (client-side only)

### 3.2 Security Measures

- **Password Protection:** Passwords are hashed using bcrypt with salt rounds before storage
- **Authentication:** JWT token-based authentication with 7-day expiration
- **Access Control:** Users can only access their own notes and files
- **Encryption in Transit:** All data transmission occurs over HTTPS
- **Private File URLs:** Uploaded files are private and require signed URLs with expiration

### 3.3 Data Retention

- **Active Accounts:** Data is retained as long as your account is active
- **Deleted Accounts:** Upon account deletion, all associated data (notes, files) is permanently deleted within 30 days
- **Audit Logs:** Security audit logs are retained for 90 days for compliance purposes

## 4. Data Sharing and Third Parties

### 4.1 Third-Party Services

We use the following third-party services:

- **Vercel Blob Storage:** For storing uploaded files (images, audio, video)
  - Data Processing Agreement: https://vercel.com/legal/dpa
  - Privacy Policy: https://vercel.com/legal/privacy-policy

### 4.2 We Do NOT Share Your Data With

- Advertising networks
- Data brokers
- AI service providers (all AI runs locally in your browser)
- Social media platforms

### 4.3 Legal Disclosure

We may disclose your information if required by law, subpoena, or to:

- Comply with legal obligations
- Protect our rights, property, or safety
- Prevent fraud or security threats
- Enforce our Terms of Service

## 5. Your Rights (GDPR & CCPA)

### 5.1 Right to Access

You can access all your personal data at any time through your account.

### 5.2 Right to Data Portability

You can export all your data (notes, tags, metadata) as a JSON file:

- Navigate to Settings → Account → Export My Data

### 5.3 Right to Rectification

You can edit or update your account information and notes at any time.

### 5.4 Right to Erasure ("Right to be Forgotten")

You can delete your account and all associated data:

- Navigate to Settings → Account → Delete Account
- This will permanently delete:
  - Your account and profile
  - All your notes and tags
  - All uploaded files
  - All audit logs (after 90 days)

### 5.5 Right to Restrict Processing

Contact us at [your-email@purpleglass.com] to request processing restrictions.

### 5.6 Right to Object

You have the right to object to certain data processing. Contact us at [your-email@purpleglass.com].

### 5.7 Right to Withdraw Consent

You can withdraw consent at any time by deleting your account.

### 5.8 Right to Lodge a Complaint

If you are in the EU, you can lodge a complaint with your local Data Protection Authority.

## 6. Cookies and Tracking

### 6.1 Essential Cookies

- **Authentication Token:** JWT token for maintaining your logged-in session

### 6.2 Optional Cookies

We do not use analytics, advertising, or tracking cookies.

### 6.3 Local Storage

We use browser local storage and IndexedDB for:

- Caching AI models (Llama, Whisper)
- Storing user preferences
- Improving application performance

You can clear this data at any time through your browser settings.

## 7. Children's Privacy

PurpleGlass is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.

## 8. International Data Transfers

Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:

- Standard Contractual Clauses (SCCs) for EU data transfers
- Compliance with GDPR requirements for international transfers

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. When we do:

- We will update the "Last Updated" date at the top
- For material changes, we will notify you via email or in-app notification
- Continued use of PurpleGlass after changes constitutes acceptance

## 10. Data Breach Notification

In the event of a data breach that affects your personal data:

- We will notify you within 72 hours
- We will notify relevant authorities as required by law
- We will provide information about the breach and steps you should take

## 11. Your California Privacy Rights (CCPA)

If you are a California resident, you have additional rights:

- **Right to Know:** What personal information we collect, use, and share
- **Right to Delete:** Request deletion of your personal information
- **Right to Opt-Out:** We do not sell your personal information
- **Right to Non-Discrimination:** We will not discriminate against you for exercising your rights

To exercise these rights, contact us at [your-email@purpleglass.com].

## 12. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or your personal data:

**Email:** [your-email@purpleglass.com]
**Data Protection Officer:** [dpo-email@purpleglass.com] (if applicable)

**Response Time:** We will respond to your inquiry within 30 days.

---

## Summary of Key Privacy Features

- ✅ **Client-Side AI:** All AI processing happens in your browser
- ✅ **Private Files:** Uploaded files require signed URLs
- ✅ **Data Export:** Export all your data as JSON
- ✅ **Account Deletion:** Delete your account and all data
- ✅ **No Tracking:** No analytics or advertising cookies
- ✅ **GDPR Compliant:** Full compliance with GDPR requirements
- ✅ **Encrypted Passwords:** Bcrypt hashing with salt
- ✅ **HTTPS Only:** All data transmission encrypted

---

**By using PurpleGlass, you acknowledge that you have read and understood this Privacy Policy.**
