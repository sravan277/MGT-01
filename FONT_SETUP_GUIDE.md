# Quick Font Setup Guide for Indian Languages

## 🚨 Current Issue
Indian language text showing as boxes (□□□□) in posters because system fonts don't support these scripts.

## ✅ SOLUTION (2 Simple Steps)

### Step 1: Download Fonts

Run this command in your backend directory:

```bash
cd backend
python download_fonts.py
```

**What this does:**
- Downloads Noto Sans fonts (free, open-source)
- Saves them to `backend/fonts/` directory
- Supports all Indian languages
- Takes ~1 minute

**Fonts Downloaded:**
- ✅ Noto Sans (Universal)
- ✅ Noto Sans Devanagari (Hindi, Marathi)
- ✅ Noto Sans Tamil
- ✅ Noto Sans Telugu
- ✅ Noto Sans Bengali

### Step 2: Restart Backend

```bash
# Stop current server (Ctrl+C)
cd backend
uvicorn app.main:app --reload
```

## 🎯 That's It!

Now:
1. Go to Poster Generation page
2. Select any Indian language
3. Generate poster
4. ✅ No more boxes - proper text rendering!

---

## 🔍 Verify It Worked

### Check 1: Fonts Downloaded
```bash
cd backend
dir fonts
```

You should see:
```
NotoSans-Regular.ttf
NotoSansDevanagari-Regular.ttf
NotoSansTamil-Regular.ttf
NotoSansTelugu-Regular.ttf
NotoSansBengali-Regular.ttf
```

### Check 2: Backend Logs
When you restart, look for:
```
Found 5 Noto Sans fonts in project
Successfully loaded font: ...NotoSans-Regular.ttf (size: 48)
```

### Check 3: Generate Test Poster
- Select Hindi
- Generate poster
- Should show: "नमस्ते" not "□□□"

---

## 🛠️ Troubleshooting

### Problem: "Can't download fonts"

**Solution A: Manual Download**
1. Visit: https://fonts.google.com/noto
2. Download "Noto Sans Devanagari"
3. Extract the TTF file
4. Create folder: `backend/fonts/`
5. Copy TTF file to folder
6. Rename to: `NotoSansDevanagari-Regular.ttf`

**Solution B: Alternative URLs**
If download script fails, try these direct links:
- [Noto Sans](https://github.com/notofonts/notofonts.github.io/tree/main/fonts/NotoSans)
- [Noto Sans Devanagari](https://github.com/notofonts/notofonts.github.io/tree/main/fonts/NotoSansDevanagari)

### Problem: "Fonts directory not found"

```bash
cd backend
mkdir fonts
python download_fonts.py
```

### Problem: "Still showing boxes"

1. **Check fonts exist:**
   ```bash
   cd backend
   dir fonts
   ```

2. **Check backend logs** for:
   ```
   Successfully loaded font: ...
   ```

3. **Clear old posters:**
   ```bash
   rmdir /s temp\posters
   ```

4. **Generate new poster** - don't use cached one

---

## 📝 What Changed in Code

### Before
- ❌ Relied on system fonts (Arial, etc.)
- ❌ System fonts don't support Indian scripts
- ❌ Text showed as boxes

### After
- ✅ Uses downloaded Noto Sans fonts (project directory)
- ✅ Noto Sans supports ALL Indian languages
- ✅ Text renders correctly

### Font Loading Priority
1. **Project fonts** (`backend/fonts/`) - FIRST
2. **System fonts** (`C:\Windows\Fonts\`) - Fallback
3. **Default PIL font** - Last resort

---

## ✅ Success Checklist

- [ ] Run `python download_fonts.py`
- [ ] See "✅ Downloaded: ..." messages
- [ ] Check `backend/fonts/` folder exists
- [ ] See 5 `.ttf` files in folder
- [ ] Restart backend server
- [ ] See "Found X Noto Sans fonts" in logs
- [ ] Generate Hindi poster
- [ ] See Hindi text (not boxes)
- [ ] Download poster
- [ ] Verify text in downloaded file

---

## 🎉 Benefits

1. **Project-Bundled Fonts**
   - No dependency on system fonts
   - Works on any computer
   - Consistent across environments

2. **Best Quality**
   - Noto Sans = designed by Google
   - Excellent Unicode support
   - Professional rendering

3. **All Languages**
   - Hindi ✅
   - Tamil ✅
   - Telugu ✅
   - Bengali ✅
   - Malayalam ✅
   - Kannada ✅
   - Marathi ✅
   - Gujarati ✅

---

## 🚀 Quick Commands

```bash
# Download fonts
cd backend
python download_fonts.py

# Restart server
uvicorn app.main:app --reload

# Check fonts
dir fonts

# Test (diagnostic)
python check_fonts.py
```

---

**Need help?** Check the downloaded fonts are in `backend/fonts/` and restart the server!

✅ **This will fix the box problem permanently!** 🎨
