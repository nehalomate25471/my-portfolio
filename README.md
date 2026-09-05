# PromptFolio

Prompt वरून Resume + Portfolio बनवणारं tool. Resume upload (PDF/DOCX) करा, prompt टाकून content update करा, आणि Resume किंवा Portfolio ZIP/GitHub वर publish करा.

## Files

```
promptfolio/
├── index.html      → main page (UI structure)
├── css/style.css   → all styling
├── js/app.js       → app logic (AI calls, file parsing, templates, export, GitHub push)
└── README.md
```

Static site आहे — कुठलाही build step / npm install लागत नाही. फक्त `index.html` ब्राउझरमध्ये उघडा (double-click किंवा VS Code च्या "Live Server" extension नी उघडा — फक्त double-click केलं तरी बहुतेक सगळं चालतं, `fetch` calls मुळे काही ब्राउझर local server मागतात).

## Local मध्ये चालवणं

```bash
# कुठल्याही साध्या server नी चालवा (recommended)
cd promptfolio
python3 -m http.server 8000
# मग ब्राउझरमध्ये उघडा: http://localhost:8000
```

## GitHub वर push करून version control सुरू करणं

पहिल्यांदा push करत असशील तर step-by-step:

```bash
# 1) या folder मध्ये जा
cd promptfolio

# 2) git repository सुरू करा
git init

# 3) सगळ्या files add करा
git add .

# 4) पहिला commit
git commit -m "Initial commit: PromptFolio app"

# 5) main branch नाव सेट करा (आधीच main असेल तर हे लागणार नाही)
git branch -M main

# 6) GitHub वर आधी एक empty repository बनवा (github.com/new, README न टाकता)
# मग तो remote म्हणून जोडा:
git remote add origin https://github.com/<tumcha-username>/<repo-nav>.git

# 7) push करा
git push -u origin main
```

यानंतर पुढच्या प्रत्येक बदलासाठी फक्त:

```bash
git add .
git commit -m "बदलाचं थोडक्यात वर्णन"
git push
```

### Branching (नवीन feature टेस्ट करायचं असेल तर)

```bash
git checkout -b feature/new-template   # नवीन branch बनवून त्यावर काम
# बदल करा, मग:
git add .
git commit -m "Added new portfolio template"
git push -u origin feature/new-template
# GitHub वर जाऊन "Pull Request" बनवून main मध्ये merge करा
```

### GitHub Pages वर थेट live करायचं असेल

Repo च्या Settings → Pages → Branch: `main`, folder: `/ (root)` सेट करा. काही मिनिटांत `https://<username>.github.io/<repo-nav>/` इथे live होईल — कारण `index.html` आधीच root मध्ये आहे.

## App मधूनच थेट GitHub वर push (in-app feature)

App मध्ये "⬆ Push to GitHub" बटण आहे — तिथे username, repo नाव आणि Personal Access Token टाकलं की app स्वतः repo बनवून `index.html`, `resume.html`, `data.json` थेट push करतो. हे वेगळं आहे — वरचा `git` flow म्हणजे हा संपूर्ण प्रोजेक्ट (code) push करणं, आणि in-app बटण म्हणजे generated portfolio push करणं. दोन्ही independent आहेत, दोन्ही वापरू शकता.

Token generate करण्यासाठी: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → `repo` scope टिक करा.

## Notes

- कुठलाही API key hardcode केलेला नाही — AI calls handled backend मार्फत होतात.
- Data कुठेही server वर save होत नाही — सगळं browser मध्येच असतं, त्यामुळे page refresh केली की data जातो; ZIP/GitHub नी export करून ठेवा.
