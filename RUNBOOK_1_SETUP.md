# Section 1: Setup

[← Back to Runbook](./RUNBOOK.md) | [Next: Implement Lookup Routes →](./RUNBOOK_2_LOOKUP.md)

---

## 1.1 Download Demo Code

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd forge-access-granted
npm install
```

> [!TIP]
> This project uses npm workspaces. Running `npm install` in the root directory automatically installs dependencies for both the `build/` and `final/` directories.

---

## 1.2 Create Twilio API Credentials

### Create an API Key

1. Log in to your [Twilio Console](https://console.twilio.com/)
2. Navigate to **Account → API keys & tokens**
3. Click **"Create API Key"**
4. Enter a friendly name (e.g., "Forge Access Granted")
5. Save your **API Key SID** (`SKxxxxxxxx`) and **Secret** securely — the Secret is only shown once

### Get Your Account SID

1. Go to the [Twilio Console Dashboard](https://console.twilio.com/)
2. Copy your **Account SID** (`ACxxxxxxxx`) from **Account Info**

---

## 1.3 Configure Twilio Verify Service

### 1.3a Create a Verify Service

1. Go to **Twilio Console → Verify → Services**
2. Click **"Create New"**
3. Give it a friendly name (e.g., "Forge Access Granted")
4. Copy the **Service SID** (`VAxxxxxxxx`) — you'll need it for your `.env` file

### 1.3b Configure SMS

SMS is enabled by default on new Verify services. Verify that:

1. In your Verify service settings, **SMS** channel is enabled
2. You have at least one phone number or messaging service configured in your Twilio account

### 1.3c Configure Email (Optional)

> [!NOTE]
> This step is optional. Skip it if you only want to test phone verification and passkeys.

To enable email verification:

1. In your Verify service settings, enable the **Email** channel
2. Configure an email integration (Twilio SendGrid or custom SMTP)
3. Set up an approved sender email address

### 1.3d Configure Passkeys (Optional)

> [!NOTE]
> This step is optional. You can come back to it when you reach [Section 5: Implement Passkeys](./RUNBOOK_5_PASSKEYS.md).

Configure your Verify service with Relying Party settings for passkeys:

1. Go to **Twilio Console → Verify → Services**
2. Select your Verify service
3. Navigate to the **Passkeys** configuration section
4. Configure the following:

| Setting | Value | Description |
|---------|-------|-------------|
| **Relying Party ID** | `localhost` | Domain where passkeys will be used |
| **Relying Party Name** | `Forge Access Granted` | Shown during passkey prompts |
| **Allowed Origins** | `http://localhost:3000` | Origin URL(s) allowed for passkeys |
| **Authenticator Attachment** | `platform` | Use device biometrics (Touch ID, Face ID, Windows Hello) |
| **User Verification** | `preferred` | Request biometric/PIN verification when available |
| **Discoverable Credentials** | `preferred` | Enable username-free login when supported |

5. Save your changes

> [!TIP]
> You can also configure passkeys via the API using Postman. The included Postman collection has an **"Update a Passkey-enabled Verify Service"** request in the **Setup** folder.
>
> Or use curl:
> ```bash
> curl -X POST "https://verify.twilio.com/v2/Services/$TWILIO_VERIFY_SERVICE_SID" \
>   -u "$TWILIO_API_KEY_SID:$TWILIO_API_KEY_SECRET" \
>   --data-urlencode "FriendlyName=Forge Access Granted" \
>   --data-urlencode "Passkeys.RelyingParty.Id=localhost" \
>   --data-urlencode "Passkeys.RelyingParty.Name=Forge Access Granted" \
>   --data-urlencode "Passkeys.RelyingParty.Origins=http://localhost:3000" \
>   --data-urlencode "Passkeys.AuthenticatorAttachment=platform" \
>   --data-urlencode "Passkeys.DiscoverableCredentials=preferred" \
>   --data-urlencode "Passkeys.UserVerification=preferred"
> ```

> [!IMPORTANT]
> The Relying Party ID (`localhost`) and Allowed Origins (`http://localhost:3000`) must match your development environment. In production, use your actual domain and origin.

---

## 1.4 Configure `.env` Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

---

## 1.5 Run the Server

Start the build server:

```bash
npm start
```

Navigate to [`http://localhost:3000`](http://localhost:3000). You should see a form asking for a phone number.

The API routes won't work yet — you'll implement them in the following sections.

> [!TIP]
> To see the completed reference implementation at any time, run:
> ```bash
> npm run start:final
> ```

---

[← Back to Runbook](./RUNBOOK.md) | [Next: Implement Lookup Routes →](./RUNBOOK_2_LOOKUP.md)
