src/
├── api/
│   ├── axiosClient.js          // Interceptor token JWT & base URL
│   ├── authService.js          // API-001 s/d API-004
│   ├── materiService.js        // API-005 s/d API-013, API-018 s/d API-022
│   ├── kuisService.js          // API-014 s/d API-016, API-023 s/d API-027
│   ├── leaderboardService.js   // API-017
│   └── adminService.js         // API-028 s/d API-046
├── components/
│   ├── common/                 // Button, Modal, Card, Navbar, Footer
│   ├── materi/                 // MateriCard, CommentSection, RatingStars
│   └── kuis/                   // QuestionItem, ScoreCard
├── context/
│   └── AuthContext.jsx         // Simpan state user, role, token, XP
├── layouts/
│   ├── AppLayout.jsx           // Navbar + Sidebar + Content untuk user/creator
│   └── AdminLayout.jsx         // Layout khusus panel admin
└── pages/
    ├── auth/                   // Login & Register
    ├── landing/                // Landing Page publik
    ├── materi/                 // MateriListPage, MateriDetailPage, MateriEditorPage
    ├── kuis/                   // KuisPlayPage, KuisEditorPage
    ├── leaderboard/            // LeaderboardPage
    └── admin/                  // UsersPage, ContentModerationPage, XpConfigPage`