// Info for the extra pages (Skills, Journey, Coding, Contact). Taken from the portfolio; edit freely.
export { stats } from "./site";

export const skills = [
  ["Languages", "lilac", ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Dart"]],
  ["Frontend", "sky", ["React", "Next.js", "Tailwind CSS", "HTML5", "CSS3", "Redux"]],
  ["Backend & data", "mint", ["Node.js", "Express.js", "Firebase", "MongoDB", "PostgreSQL", "REST APIs"]],
  ["Algorithms", "peach", ["Dynamic Programming", "Graph Theory", "Binary Search", "STL", "Number Theory"]],
  ["Machine learning", "lemon", ["Neural Networks", "LSTM", "NLP", "Pandas", "Jupyter"]],
  ["Cloud & tools", "lilac", ["AWS", "Docker", "Git", "Linux", "Vercel", "CI/CD", "Figma", "LaTeX"]],
];

export const jobs = [
  { t: "Software Engineering Intern", o: "Pathao Courier", p: "2024 – Present", d: "Optimizing logistics algorithms and improving courier tracking efficiency." },
  { t: "Junior Frontend Developer", o: "CodeStack", p: "2022 – 2023", d: "Built and tuned responsive, interactive user interfaces." },
  { t: "Course Instructor", o: "ICT School", p: "2021 – 2022", d: "Taught programming basics with hands-on guidance and real-world examples." },
];

export const edu = [
  { t: "B.Sc in Computer Science & Engineering", o: "Premier University, Chittagong", p: "2022 – 2026", d: "Software engineering, algorithms and full-stack development. Undergraduate thesis on applied AI/ML." },
  { t: "Higher Secondary Certificate", o: "Govt. Hazi Mohammad Mohsin College", p: "2017 – 2019", d: "Science group, GPA 5.00." },
  { t: "Secondary School Certificate", o: "Govt. Muslim High School", p: "2015 – 2017", d: "Science group, GPA 5.00." },
];

export const certs = [
  { t: "Supervised Machine Learning: Regression and Classification", o: "Coursera", p: "2025", u: "https://coursera.org/share/be11b6c4db8d1978211a309bbf3832d4" },
  { t: "Complete Data Science, ML, DL, NLP Bootcamp", o: "Udemy", p: "2024", u: "https://www.udemy.com/course/complete-machine-learning-nlp-bootcamp-mlops-deployment/" },
  { t: "Number Theory Fundamentals", o: "Udemy", p: "2023", u: "https://www.udemy.com/course/number-theory-fundamentals/" },
  { t: "Problem Solving (Intermediate)", o: "HackerRank", p: "2022", u: "https://www.hackerrank.com/certificates/f293a98f33f8" },
  { t: "Problem Solving (Basic)", o: "HackerRank", p: "2022", u: "https://www.hackerrank.com/certificates/96a1aa85c641" },
  { t: "Python Complete Course", o: "Udemy", p: "2022", u: "https://www.udemy.com/course/python-complete-course-for-beginners/" },
  { t: "Full Stack Web Development (Batch 5)", o: "Programming Hero", p: "2021 – 2022", u: "https://web.programming-hero.com/course-details" },
];

export const pubs = [
  { t: "AgentGuard: A Runtime Security Framework for Detecting and Mitigating Prompt Injection Attacks in Agentic AI Systems", o: "IEEE ICCIT 2026", p: "2026", s: "Accepted · Oral presentation", c: "Conference Paper", w: "Cox’s Bazar, Bangladesh · 18–20 Dec 2026 · Hybrid", n: "ICCIT is the longest-running IEEE-sponsored peer-reviewed conference in Bangladesh. The 29th edition is organized by the IEEE Bangladesh Section in Cox’s Bazar, 18–20 December 2026, in hybrid mode.", d: "AgentGuard is runtime security middleware that detects and mitigates prompt injection across inputs, memory, tools and RAG in agentic AI systems. Tested on seven platforms and 6,708 cases, it reached 86.2% defense success rate, F1 0.891 and AUROC 0.924 at only 4.7% latency cost.", id: "3214", v: "29th International Conference on Computer and Information Technology", u: "https://iccit.org.bd/" },
];

export const cp = [
  { n: "Codeforces", h: "Hafiz_Sakib", r: "1288", rk: "Pupil", c: "sky", e: 430, m: 170, hd: 47, u: "https://codeforces.com/profile/Hafiz_Sakib" },
  { n: "LeetCode", h: "hafiz_Sakib", r: "1574", rk: "Top 28.17%", c: "lemon", e: 13, m: 13, hd: 0, u: "https://leetcode.com/u/hafiz_Sakib/" },
  { n: "HackerRank", h: "Hafiz_Sakib", r: "Gold", rk: "Python", c: "mint", e: 97, m: 23, hd: 3, u: "https://www.hackerrank.com/profile/Hafiz_Sakib" },
  { n: "GeeksforGeeks", h: "hafiz_sakib", r: "25", rk: "Institute rank 18", c: "peach", e: 14, m: 3, hd: 0, u: "https://www.geeksforgeeks.org/profile/hafiz_sakib" },
];

export const contact = { phone: "+880 1516 195904", phoneHref: "tel:+8801516195904" };
