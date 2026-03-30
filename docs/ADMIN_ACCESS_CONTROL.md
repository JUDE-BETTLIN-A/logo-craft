# 🔐 AI Sales Bot - Admin Access Control

## Security Implementation

The AI Sales Bot feature is **strictly protected** and only accessible by the admin user: **judebettlin@gmail.com**

---

## 🔑 Access Control

### Who Can Access?
- ✅ **judebettlin@gmail.com** - Full admin access to AI Sales Bot
- ❌ **All other users** - Redirected to dashboard, access denied

### Protected Routes
```
/sell                          - AI Sales Bot dashboard
/api/telegram-bot/*            - Bot management APIs
/api/leads/*                   - Lead management APIs
/api/negotiations              - Negotiation data APIs
```

---

## 🛡️ Security Features

### 1. **Middleware Protection**
- All admin routes protected by Next.js middleware
- Session validation on every request
- Email-based authorization check
- Automatic redirect for unauthorized users

### 2. **Session Management**
- HTTP-only cookies (secure, XSS-proof)
- 7-day session expiry
- Automatic session cleanup on logout
- Server-side session validation

### 3. **API Protection**
- All admin APIs check authentication
- Returns 401/403 for unauthorized access
- Admin email verified on every API call

### 4. **UI Protection**
- AI Sales Bot tab only visible to admin
- Admin badge shown in navbar
- User profile shows admin status
- Non-admin users redirected to dashboard

---

## 🚀 How to Use

### For Admin (judebettlin@gmail.com)

1. **Sign Up / Sign In**
   - Go to `/auth/signin`
   - Use email: `judebettlin@gmail.com`
   - Enter your password

2. **Access AI Sales Bot**
   - After login, you'll see:
     - "AI Sales Bot" link in navbar (with 🤖 icon)
     - "Admin" badge next to your name
     - Direct redirect to `/sell` page

3. **Use the Feature**
   - Connect your Telegram account
   - Import customer leads
   - Start AI outreach campaigns
   - Monitor negotiations in real-time

### For Regular Users

1. **Sign Up / Sign In**
   - Any email except judebettlin@gmail.com

2. **Access**
   - AI Sales Bot link is **hidden** from navbar
   - Attempting to access `/sell` redirects to `/dashboard`
   - API calls return 403 Forbidden

---

## 📁 Files Modified/Created

### New Files
```
src/middleware.ts                      - Route protection logic
src/app/api/auth/me/route.ts           - Get current user
src/app/api/auth/logout/route.ts       - Logout endpoint
src/components/navbar.tsx              - Updated with admin UI
```

### Modified Files
```
prisma/schema.prisma                   - Added isAdmin field
src/app/api/auth/login/route.ts        - Added admin check + session
src/app/api/auth/register/route.ts     - Added admin check + session
src/app/auth/signin/page.tsx           - Admin redirect logic
```

---

## 🔐 Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| **No session** | Redirect to `/auth/signin` |
| **Wrong email** | Redirect to `/dashboard` |
| **Expired session** | Redirect to `/auth/signin` |
| **Invalid cookie** | Redirect to `/auth/signin` |
| **Direct API access** | Returns 401/403 |
| **Manual URL entry** | Middleware redirects |
| **Bookmark /sell** | Redirects if not admin |
| **Shared link** | Only admin can access |

---

## 🧪 Testing

### Test as Admin
1. Sign up with `judebettlin@gmail.com`
2. Verify:
   - ✅ See "AI Sales Bot" in navbar
   - ✅ See "Admin" badge
   - ✅ Can access `/sell`
   - ✅ Redirected to `/sell` after login

### Test as Regular User
1. Sign up with any other email
2. Verify:
   - ❌ No "AI Sales Bot" in navbar
   - ❌ No admin badge
   - ❌ `/sell` redirects to `/dashboard`
   - ❌ API calls return 403

### Test Session Security
1. Login as admin
2. Clear cookies
3. Verify:
   - ❌ Can't access `/sell` anymore
   - ❌ Redirected to signin

---

## 📊 Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  image         String?
  isAdmin       Boolean   @default(false)  // ← Admin flag
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // ... relations
}
```

---

## 🎯 Admin UI Indicators

### Navbar (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│  LogoCraft AI                                           │
│                                                         │
│  Logo Maker  [🤖 AI Sales Bot 🔹Admin]  Pricing  My... │
│                                                         │
│  [👤 User Name    ▼]                                   │
│       Admin                                             │
└─────────────────────────────────────────────────────────┘
```

### User Menu Dropdown
```
┌──────────────────────────┐
│  User Name               │
│  judebettlin@gmail.com   │
│  [🛡️ Admin Access]       │
├──────────────────────────┤
│  📊 Dashboard            │
│  🤖 AI Sales Bot         │  ← Only for admin
│  🚪 Sign Out             │
└──────────────────────────┘
```

---

## 🔧 Configuration

### Change Admin Email
Edit these files to change the admin email:

1. `src/middleware.ts` (line 4)
2. `src/app/api/auth/login/route.ts` (line 5)
3. `src/app/api/auth/register/route.ts` (line 5)

```typescript
const ADMIN_EMAIL = "your-new-email@example.com";
```

---

## 🚨 Security Notes

1. **Never commit `.env.local`** - Contains API keys
2. **Use HTTPS in production** - Session cookies marked secure
3. **Strong password** - Protect the admin account
4. **Session expiry** - 7 days, adjust in code if needed
5. **HTTP-only cookies** - Prevents XSS attacks

---

## 💡 Future Enhancements

- [ ] Add 2FA for admin account
- [ ] Add activity logging
- [ ] Add multiple admin users
- [ ] Add role-based permissions
- [ ] Add session management UI

---

**Last Updated**: March 29, 2026
**Protected By**: Next.js Middleware + Session Cookies + Email Verification
