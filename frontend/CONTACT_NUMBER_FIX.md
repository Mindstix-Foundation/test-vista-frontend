# Contact Number Validation Fix

## Problem
When adding a new teacher through the AddTeacher.vue form, users were getting an "invalid contact number" error even when entering valid Indian phone numbers.

## Root Cause
**Backend validation** (in `add-teacher.dto.ts`):
- Uses `@IsPhoneNumber()` decorator from class-validator
- Expects phone numbers in international format with country code (e.g., `+911234567890`)

**Frontend validation** (in `validationConstants.ts`):
- Validates 10-digit Indian numbers starting with 6-9
- But was sending the raw contact number without proper formatting for API submission

## Solution
### 1. Frontend Fix (AddTeacher.vue)
```typescript
// Added import
import { formatContactNumberForAPI } from '@/utils/validationConstants'

// Updated payload creation
const payload = {
  // ... other fields
  contact_number: formatContactNumberForAPI(data.formData.contactNumber),
  alternate_contact_number: data.formData.alternateContactNumber 
    ? formatContactNumberForAPI(data.formData.alternateContactNumber)
    : undefined,
  // ... other fields
}
```

### 2. Improved Validation (validationConstants.ts)
```typescript
export const validateContactNumber = (number: string): boolean => {
  if (!number) return false
  
  const cleaned = number.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    // Plain 10-digit format - must start with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(cleaned)
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // +91 prefixed format
    const phoneNumber = cleaned.substring(2)
    return phoneNumber.length === 10 && /^[6-9]\d{9}$/.test(phoneNumber)
  }
  
  return false
}
```

## How It Works
1. **User Input**: User enters `9876543210` in the form
2. **Frontend Validation**: Validates as 10-digit number starting with 9 ✅
3. **API Formatting**: `formatContactNumberForAPI()` converts to `+919876543210`
4. **Backend Validation**: `@IsPhoneNumber()` validates the international format ✅
5. **Success**: Teacher is created successfully

## Testing
To test the fix:
1. Navigate to `/admin/teacher` in the frontend
2. Click "Add New Teacher"
3. Fill the form with a valid Indian contact number (e.g., `9876543210`)
4. Submit the form
5. Teacher should be created successfully without validation errors

## Files Modified
- `/frontend/src/views/admin/teacher/AddTeacher.vue`
- `/frontend/src/utils/validationConstants.ts`

## Validation Rules
**Valid Indian Phone Numbers:**
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Examples: `9876543210`, `8765432109`, `7654321098`, `6543210987`

**Invalid Examples:**
- `1234567890` (starts with 1)
- `98765432` (less than 10 digits)
- `987654321012` (more than 10 digits)
- `abcd567890` (contains letters) 