const fs = require("fs");
const path = require("path");

const USERNAME = "SB-Siba";
const PROFILE_REPO = "SB-Siba";

async function github(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "SB-Siba-Profile-README"
    }
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

function cleanRepositoryName(name) {
  return name
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectTechnologies(repo, files) {
  const technologies = new Set();

  const language = repo.language;
  const fileNames = files.map((file) => file.name.toLowerCase());

  // Primary language from GitHub
  if (language) {
    technologies.add(language);
  }

  // Node.js / JavaScript
  if (
    fileNames.includes("package.json") ||
    fileNames.includes("package-lock.json") ||
    fileNames.includes("pnpm-lock.yaml") ||
    fileNames.includes("yarn.lock")
  ) {
    technologies.add("JavaScript");
    technologies.add("Node.js");
  }

  // TypeScript
  if (
    fileNames.includes("tsconfig.json") ||
    fileNames.some((file) => file.endsWith(".ts")) ||
    fileNames.some((file) => file.endsWith(".tsx"))
  ) {
    technologies.add("TypeScript");
  }

  // React
  if (
    fileNames.some((file) => file.endsWith(".jsx")) ||
    fileNames.some((file) => file.endsWith(".tsx")) ||
    fileNames.includes("vite.config.js") ||
    fileNames.includes("vite.config.ts")
  ) {
    technologies.add("React");
  }

  // Vite
  if (
    fileNames.includes("vite.config.js") ||
    fileNames.includes("vite.config.ts")
  ) {
    technologies.add("Vite");
  }

  // Tailwind
  if (
    fileNames.includes("tailwind.config.js") ||
    fileNames.includes("tailwind.config.cjs") ||
    fileNames.includes("tailwind.config.ts")
  ) {
    technologies.add("Tailwind CSS");
  }

  // Python
  if (
    fileNames.includes("requirements.txt") ||
    fileNames.includes("pyproject.toml") ||
    fileNames.includes("setup.py") ||
    fileNames.includes("manage.py") ||
    fileNames.some((file) => file.endsWith(".py"))
  ) {
    technologies.add("Python");
  }

  // Django
  if (
    fileNames.includes("manage.py") ||
    fileNames.includes("requirements.txt")
  ) {
    technologies.add("Django");
  }

  // Java
  if (
    fileNames.some((file) => file.endsWith(".java")) ||
    fileNames.includes("pom.xml") ||
    fileNames.includes("build.gradle") ||
    fileNames.includes("build.gradle.kts")
  ) {
    technologies.add("Java");
  }

  // PHP
  if (
    fileNames.some((file) => file.endsWith(".php")) ||
    fileNames.includes("composer.json")
  ) {
    technologies.add("PHP");
  }

  // HTML
  if (fileNames.some((file) => file.endsWith(".html"))) {
    technologies.add("HTML");
  }

  // CSS
  if (
    fileNames.some((file) => file.endsWith(".css")) ||
    fileNames.some((file) => file.endsWith(".scss"))
  ) {
    technologies.add("CSS");
  }

  // Google Apps Script
  if (
    fileNames.some((file) => file.endsWith(".gs")) ||
    fileNames.includes("appsscript.json")
  ) {
    technologies.add("Google Apps Script");
  }

  return [...technologies];
}

async function getRepositories() {
  let page = 1;
  let repositories = [];

  while (true) {
    const data = await github(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&sort=updated`
    );

    if (!data.length) {
      break;
    }

    repositories = repositories.concat(data);
    page++;
  }

  return repositories;
}

async function getRepositoryFiles(repoName) {
  try {
    return await github(
      `https://api.github.com/repos/${repoName}/contents`
    );
  } catch (error) {
    console.log(`Could not inspect files for ${repoName}`);
    return [];
  }
}

function createProjectSection(repo) {
  const title = cleanRepositoryName(repo.name);

  const description =
    repo.description ||
    "A software project built with modern development technologies.";

  const technologies =
    repo.technologies.length > 0
      ? repo.technologies
          .slice(0, 6)
          .map((tech) => `\`${tech}\``)
          .join(" · ")
      : "`Not detected`";

  return `### 🚀 [${title}](${repo.html_url})

${description}

**Tech Stack:** ${technologies}

⭐ ${repo.stargazers_count} · 🍴 ${repo.forks_count}`;
}

async function main() {
  console.log("Fetching GitHub repositories...");

  let repositories = await getRepositories();

  repositories = repositories.filter(
    (repo) => repo.name !== PROFILE_REPO
  );

  console.log(`Found ${repositories.length} repositories.`);

  const analyzedRepositories = [];

  for (const repo of repositories) {
    console.log(`Analyzing: ${repo.full_name}`);

    const files = await getRepositoryFiles(repo.full_name);

    const technologies = detectTechnologies(repo, files);

    analyzedRepositories.push({
      ...repo,
      technologies
    });
  }

  // Sort by recently updated
  analyzedRepositories.sort(
    (a, b) =>
      new Date(b.updated_at) - new Date(a.updated_at)
  );

  // Show only the 10 most recently updated projects
  const featuredProjects =
    analyzedRepositories.slice(0, 10);

  // Repository language statistics
  const languageCounts = {};

  analyzedRepositories.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] =
        (languageCounts[repo.language] || 0) + 1;
    }
  });

  const languages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([language, count]) =>
        `- **${language}** — ${count} ${
          count === 1 ? "repository" : "repositories"
        }`
    )
    .join("\n");

  const projectSections = featuredProjects
    .map(createProjectSection)
    .join("\n\n");

  const readme = `# 👋 Hi, I'm Sibananda Behera

### Full Stack Developer | React | TypeScript | Python | Django

I'm a software developer focused on building modern web applications, business platforms, learning management systems, and scalable digital products.

I enjoy working across frontend, backend, APIs, databases, integrations, and deployment.

---

## 👨‍💻 About Me

- 💻 Full Stack Developer
- ⚛️ React & TypeScript development
- 🐍 Python & Django development
- 🔌 REST API & backend development
- 🗄️ PostgreSQL / MySQL
- 🚀 GitHub, CI/CD & deployment
- 🎨 Modern responsive UI development
- 🔗 Third-party integrations and automation

---

## 🛠️ Core Technologies

### Frontend

React · TypeScript · JavaScript · HTML · CSS · Tailwind CSS

### Backend

Python · Django · Django REST Framework · Node.js · Express

### Database

PostgreSQL · MySQL

### Tools & Platforms

Git · GitHub · GitHub Actions · Vite · REST APIs

---

## 📊 Repository Languages

${languages || "- No language data available."}

---

## 🚀 Featured Projects

${projectSections}

---

## 📈 GitHub Statistics

<p align="center">
  <img
    src="https://github-readme-stats.vercel.app/api?username=${USERNAME}&show_icons=true&hide_border=true"
    alt="GitHub Stats"
  />
  <img
    src="https://github-readme-stats.vercel.app/api/top-langs/?username=${USERNAME}&layout=compact&hide_border=true"
    alt="Top Languages"
  />
</p>

---

## 🔗 Connect With Me

🌐 [Portfolio](https://siba-portfolio.vercel.app/)

💻 [GitHub](https://github.com/${USERNAME})

---

<p align="center">
  <i>Building, learning and improving every day.</i>
</p>
`;

  const readmePath = path.join(
    process.cwd(),
    "README.md"
  );

  fs.writeFileSync(readmePath, readme, "utf8");

  console.log("README.md successfully generated.");
}

main().catch((error) => {
  console.error("Failed to generate README:");
  console.error(error);
  process.exit(1);
});