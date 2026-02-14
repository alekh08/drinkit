# DRINKIT Logo Integration

## Logo File
Place your logo image at: `frontend/public/drinkit-logo.png`

## Logo Specifications
- File: `drinkit-logo.png`
- Location: Place in `frontend/public/` directory
- Format: PNG with transparency
- Recommended size: 400x400px or higher (will be scaled down)

## Where the Logo is Used
- Login page header (24px height)
- All dashboard navigation bars (8px/32px height)

## To Use Your Logo
1. Save your logo image as `drinkit-logo.png`
2. Copy it to `C:\Users\alekh\OneDrive\Desktop\drinkit\frontend\public\drinkit-logo.png`
3. The frontend will automatically display it

## Current Implementation
The logo is referenced in:
- `/frontend/src/pages/Login.jsx` - Login page
- `/frontend/src/components/Logo.jsx` - Reusable component

All pages use `<img src="/drinkit-logo.png" />` to display the logo.
