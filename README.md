# SmartStock

<!-- 
SmartStock/
│
├─ public/
│  ├─ index.html
│  ├─ dashboard.html
│  ├─ style/
│  │  ├─ style.css
│  │  └─ styleDashboard.css
│  ├─ icon/
│  │  ├─ logo-small.ico
│  │  └─ senai.png
│  ├─ imagesDash/
│  │  ├─ senai.png
│  │  ├─ henkel.png
│  │  └─ dell.png
│  └─ scripts/
│     ├─ loginScript.js
│     └─ dashboardScript.js
│
├─ routes/
│  ├─ auth.js
│  ├─ authController.js
│  └─ authMiddleware.js
│
├─ server/
│  └─ db.js
│
├─ schemas/
│  ├─ login.js
│  └─ register.js
│
├─ .env
├─ .env.example
├─ package.json
└─ server.js



SmartStock/
│
├─ public/
│  ├─ index.html                # Tela de login
│  ├─ dashboard.html            # Dashboard principal
│  ├─ style/
│  │  ├─ style.css              # CSS da tela de login
│  │  └─ styleDashboard.css     # CSS do dashboard
│  ├─ icon/
│  │  ├─ logo-small.ico
│  │  └─ senai.png
│  ├─ imagesDash/
│  │  ├─ senai.png
│  │  ├─ henkel.png
│  │  └─ dell.png
│  └─ scripts/
│     ├─ loginScript.js         # JS da tela de login
│     └─ dashboardScript.js     # JS do dashboard
│
├─ routes/
│  ├─ auth.js                   # Rotas de login, token, registro e dashboard-tables
│  ├─ authController.js         # Funções login, loginWithToken, validateEmail, register
│  └─ authMiddleware.js         # Middleware JWT (verificarJWT)
│
├─ server/
│  └─ db.js                     # Pool de conexão com MySQL
│
├─ schemas/
│  ├─ login.js                  # Validação do login (Yup)
│  └─ register.js               # Validação do registro (Yup)
│
├─ .env                         # Variáveis sensíveis (não subir no Git)
├─ .env.example                 # Exemplo de variáveis para Git
├─ package.json
└─ server.js                     # Arquivo principal do Node.js/Express

-->