(function () {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const isAdmin =
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "::1";

  document.body.classList.toggle("admin-mode", isAdmin);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  toggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
    toggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-label", "打开导航");
    toggle.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    {
      rootMargin: "-20% 0px -64% 0px",
      threshold: [0.16, 0.32, 0.56]
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const projectTabs = document.querySelector(".project-tabs");
  let tabs = Array.from(document.querySelectorAll("[data-filter]"));
  const projectScroller = document.querySelector("[data-project-scroll]");
  const addProjectCard = document.querySelector(".project-add-card");
  const projectModal = document.querySelector("[data-project-modal]");
  const projectForm = document.querySelector("[data-project-form]");
  const projectModalTitle = document.querySelector("#projectModalTitle");
  const projectModalEyebrow = document.querySelector("[data-project-eyebrow]");
  const projectSubmitButton = document.querySelector("[data-project-submit]");
  const categoryModal = document.querySelector("[data-category-modal]");
  const categoryForm = document.querySelector("[data-category-form]");
  const publicationList = document.querySelector("[data-publication-list]");
  const publicationModal = document.querySelector("[data-publication-modal]");
  const publicationForm = document.querySelector("[data-publication-form]");
  const publicationModalTitle = document.querySelector("#publicationModalTitle");
  const publicationModalEyebrow = document.querySelector("[data-publication-eyebrow]");
  const publicationSubmitButton = document.querySelector("[data-publication-submit]");
  const blogList = document.querySelector("[data-blog-list]");
  const blogModal = document.querySelector("[data-blog-modal]");
  const blogForm = document.querySelector("[data-blog-form]");
  const blogModalTitle = document.querySelector("#blogModalTitle");
  const blogModalEyebrow = document.querySelector("[data-blog-eyebrow]");
  const blogSubmitButton = document.querySelector("[data-blog-submit]");
  const deleteModal = document.querySelector("[data-delete-modal]");
  const deleteMessage = document.querySelector("[data-delete-message]");
  const confirmDeleteButton = document.querySelector("[data-confirm-delete]");
  const projectCategoryField = projectForm?.elements.category;
  let activeProjectFilter = "all";
  let pendingDeleteAction = null;

  const storedProjectsKey = "personal-site-projects";
  const storedCategoriesKey = "personal-site-categories";
  const deletedProjectsKey = "personal-site-deleted-projects";
  const deletedCategoriesKey = "personal-site-deleted-categories";
  const storedPublicationsKey = "personal-site-publications";
  const deletedPublicationsKey = "personal-site-deleted-publications";
  const storedBlogsKey = "personal-site-blogs";
  const deletedBlogsKey = "personal-site-deleted-blogs";

  const readStoredArray = (key) => {
    if (!isAdmin) return [];
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const writeStoredArray = (key, value) => {
    if (!isAdmin) return;
    localStorage.setItem(key, JSON.stringify(value));
  };

  const readStoredProjects = () => readStoredArray(storedProjectsKey);
  const writeStoredProjects = (projects) => writeStoredArray(storedProjectsKey, projects);
  const readStoredCategories = () => readStoredArray(storedCategoriesKey);
  const writeStoredCategories = (categories) => writeStoredArray(storedCategoriesKey, categories);
  const readDeletedProjects = () => readStoredArray(deletedProjectsKey);
  const writeDeletedProjects = (projects) => writeStoredArray(deletedProjectsKey, projects);
  const readDeletedCategories = () => readStoredArray(deletedCategoriesKey);
  const writeDeletedCategories = (categories) => writeStoredArray(deletedCategoriesKey, categories);
  const readStoredPublications = () => readStoredArray(storedPublicationsKey);
  const writeStoredPublications = (publications) => writeStoredArray(storedPublicationsKey, publications);
  const readDeletedPublications = () => readStoredArray(deletedPublicationsKey);
  const writeDeletedPublications = (publications) => writeStoredArray(deletedPublicationsKey, publications);
  const readStoredBlogs = () => readStoredArray(storedBlogsKey);
  const writeStoredBlogs = (blogs) => writeStoredArray(storedBlogsKey, blogs);
  const readDeletedBlogs = () => readStoredArray(deletedBlogsKey);
  const writeDeletedBlogs = (blogs) => writeStoredArray(deletedBlogsKey, blogs);

  const getProjectCards = () => Array.from(document.querySelectorAll(".project-card"));

  const updateProjectNumbers = () => {
    getProjectCards().forEach((card, index) => {
      const number = card.querySelector(".project-kicker span");
      if (number) {
        number.textContent = String(index + 1).padStart(2, "0");
      }
    });
  };

  const refreshTabs = () => {
    tabs = Array.from(document.querySelectorAll("[data-filter]"));
  };

  const setActiveProjectFilter = (filter) => {
    activeProjectFilter = filter;
    tabs.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === filter));
    getProjectCards().forEach((card) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !visible);
    });
    projectScroller?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const bindFilterTab = (tab) => {
    if (tab.dataset.boundFilter === "true") return;
    tab.dataset.boundFilter = "true";
    tab.addEventListener("click", () => {
      setActiveProjectFilter(tab.dataset.filter);
    });
  };

  const projectIcons = {
    eeg: "activity",
    ssvep: "drone",
    robotics: "bot"
  };

  const escapeHTML = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const createProjectId = (project, fallback = Date.now()) => {
    if (project.id) return project.id;
    const seed = `${project.category || "project"}-${project.title || fallback}`;
    const slug = seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${slug || "project"}-${String(fallback).toLowerCase()}`;
  };

  const normalizeProjectURL = (url) => {
    const trimmed = String(url || "").trim();
    if (!trimmed) return "https://github.com/LWL2000";
    if (/^(https?:|#|\/)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const findProjectCard = (projectId) => getProjectCards().find((card) => card.dataset.projectId === projectId);

  const getProjectData = (card) => ({
    id: card.dataset.projectId,
    category: card.dataset.category || "eeg",
    title: card.querySelector("h3")?.textContent.trim() || "",
    description: card.querySelector("p")?.textContent.trim() || "",
    meta: Array.from(card.querySelectorAll(".project-meta li")).map((item) => item.textContent.trim()),
    url: card.dataset.projectUrl || "https://github.com/LWL2000"
  });

  const setProjectCardData = (card, project) => {
    const projectId = createProjectId(project);
    const metaItems = (project.meta || []).filter(Boolean);
    card.dataset.category = project.category;
    card.dataset.projectId = projectId;
    card.dataset.projectUrl = normalizeProjectURL(project.url);
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `打开项目：${project.title}`);

    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const meta = card.querySelector(".project-meta");
    if (title) title.textContent = project.title;
    if (description) description.textContent = project.description;
    if (meta) {
      meta.innerHTML = metaItems.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    }
  };

  const upsertStoredProject = (project) => {
    const storedProjects = readStoredProjects();
    const index = storedProjects.findIndex((item) => item.id === project.id);
    if (index >= 0) {
      storedProjects[index] = project;
      writeStoredProjects(storedProjects);
      return;
    }
    writeStoredProjects([...storedProjects, project]);
  };

  const rememberDeletedProject = (projectId) => {
    if (!projectId) return;
    const deletedProjects = new Set(readDeletedProjects());
    deletedProjects.add(projectId);
    writeDeletedProjects([...deletedProjects]);
  };

  const forgetDeletedProject = (projectId) => {
    writeDeletedProjects(readDeletedProjects().filter((item) => item !== projectId));
  };

  const rememberDeletedCategory = (categoryValue) => {
    if (!categoryValue || categoryValue === "all") return;
    const deletedCategories = new Set(readDeletedCategories());
    deletedCategories.add(categoryValue);
    writeDeletedCategories([...deletedCategories]);
  };

  const forgetDeletedCategory = (categoryValue) => {
    writeDeletedCategories(readDeletedCategories().filter((item) => item !== categoryValue));
  };

  const createProjectCard = (project) => {
    const article = document.createElement("article");
    article.className = "project-card";
    article.dataset.category = project.category;
    article.dataset.projectId = createProjectId(project);
    article.dataset.projectUrl = normalizeProjectURL(project.url);
    article.setAttribute("role", "link");
    article.setAttribute("tabindex", "0");
    article.setAttribute("aria-label", `打开项目：${project.title}`);
    if (project.persisted) {
      article.dataset.persistedProject = "true";
    }
    const number = String(getProjectCards().length + 1).padStart(2, "0");
    const metaItems = (project.meta || []).filter(Boolean);
    article.innerHTML = `
      <div class="project-actions">
        <button class="icon-button project-action" type="button" aria-label="编辑项目" title="编辑项目" data-edit-project data-admin-only>
          <i data-lucide="pencil"></i>
        </button>
        <button class="icon-button project-action danger-action" type="button" aria-label="删除项目" title="删除项目" data-delete-project data-admin-only>
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <div class="project-kicker">
        <span>${number}</span>
        <i data-lucide="${projectIcons[project.category] || "cpu"}"></i>
      </div>
      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.description)}</p>
      <ul class="project-meta">
        ${metaItems.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
      </ul>
      <div class="project-card-footer">
        <strong>查看代码</strong>
        <i data-lucide="arrow-up-right"></i>
      </div>
    `;
    projectScroller?.insertBefore(article, addProjectCard);
    if (window.lucide) {
      window.lucide.createIcons();
    }
    updateProjectNumbers();
    return article;
  };

  const addCategoryOption = (category) => {
    if (!projectCategoryField || !category.value) return;
    const exists = Array.from(projectCategoryField.options).some((option) => option.value === category.value);
    if (exists) return;
    const option = new Option(category.label, category.value);
    projectCategoryField.appendChild(option);
  };

  const removeCategoryOption = (categoryValue) => {
    Array.from(projectCategoryField?.options || []).forEach((option) => {
      if (option.value === categoryValue) {
        option.remove();
      }
    });
  };

  const addCategoryTab = (category) => {
    if (!projectTabs || !category.value || category.value === "all") return null;
    const existing = Array.from(projectTabs.querySelectorAll("[data-filter]")).find(
      (tab) => tab.dataset.filter === category.value
    );
    if (existing) return existing;

    const button = document.createElement("button");
    button.className = "tab";
    button.type = "button";
    button.dataset.filter = category.value;
    button.textContent = category.label;
    projectTabs.appendChild(button);
    bindFilterTab(button);
    refreshTabs();
    return button;
  };

  const removeCategoryTab = (categoryValue) => {
    if (!projectTabs || categoryValue === "all") return;
    Array.from(projectTabs.querySelectorAll("[data-filter]")).forEach((tab) => {
      if (tab.dataset.filter === categoryValue) {
        tab.remove();
      }
    });
    refreshTabs();
  };

  const normalizeCategoryValue = (label) => {
    const slug = String(label)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || `category-${Date.now()}`;
  };

  const createCategoryFromName = (name) => {
    const label = String(name || "").trim();
    if (!label) return null;
    const value = normalizeCategoryValue(label);
    const existingOption = Array.from(projectCategoryField?.options || []).find(
      (option) => option.value === value || option.textContent.trim().toLowerCase() === label.toLowerCase()
    );
    if (existingOption) {
      return {
        value: existingOption.value,
        label: existingOption.textContent.trim(),
        existing: true
      };
    }
    return { value, label, existing: false };
  };

  const removeProjectRecord = (card) => {
    const projectId = card?.dataset.projectId;
    if (!projectId) return;

    const storedProjects = readStoredProjects();
    const nextStoredProjects = storedProjects.filter((project) => project.id !== projectId);
    const wasStored = nextStoredProjects.length !== storedProjects.length;
    if (wasStored) {
      writeStoredProjects(nextStoredProjects);
    }
    if (!card.dataset.persistedProject) {
      rememberDeletedProject(projectId);
    } else {
      forgetDeletedProject(projectId);
    }

    card.remove();
  };

  const deleteProjectCard = (card) => {
    if (!isAdmin) return;
    removeProjectRecord(card);
    updateProjectNumbers();
    setActiveProjectFilter(activeProjectFilter);
  };

  const openProjectURL = (card) => {
    const url = normalizeProjectURL(card.dataset.projectUrl);
    if (!url) return;
    window.location.href = url;
  };

  const deleteCategory = (categoryValue) => {
    if (!isAdmin) return;
    if (!categoryValue || categoryValue === "all") return;

    getProjectCards()
      .filter((card) => card.dataset.category === categoryValue)
      .forEach(removeProjectRecord);

    removeCategoryTab(categoryValue);
    removeCategoryOption(categoryValue);
    writeStoredCategories(readStoredCategories().filter((category) => category.value !== categoryValue));
    rememberDeletedCategory(categoryValue);
    updateProjectNumbers();
    setActiveProjectFilter(activeProjectFilter === categoryValue ? "all" : activeProjectFilter);
  };

  const getPublicationItems = () => Array.from(document.querySelectorAll(".timeline-item[data-publication-id]"));

  const createPublicationId = (publication, fallback = Date.now()) => {
    if (publication.id) return publication.id;
    const seed = `${publication.year || "publication"}-${publication.title || fallback}`;
    const slug = seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${slug || "publication"}-${String(fallback).toLowerCase()}`;
  };

  const findPublicationItem = (publicationId) =>
    getPublicationItems().find((item) => item.dataset.publicationId === publicationId);

  const getPublicationData = (item) => ({
    id: item.dataset.publicationId,
    year: item.querySelector(".time")?.textContent.trim() || "",
    title: item.querySelector("h3")?.textContent.trim() || "",
    meta: item.querySelector("p")?.textContent.trim() || ""
  });

  const setPublicationItemData = (item, publication) => {
    item.dataset.publicationId = createPublicationId(publication);
    const time = item.querySelector(".time");
    const title = item.querySelector("h3");
    const meta = item.querySelector("p");
    if (time) time.textContent = publication.year;
    if (title) title.textContent = publication.title;
    if (meta) meta.textContent = publication.meta;
  };

  const createPublicationItem = (publication) => {
    if (!publicationList) return null;
    const article = document.createElement("article");
    article.className = "timeline-item";
    article.dataset.publicationId = createPublicationId(publication);
    if (publication.persisted) {
      article.dataset.persistedPublication = "true";
    }
    article.innerHTML = `
      <div class="publication-actions">
        <button class="icon-button publication-action" type="button" aria-label="编辑论文" title="编辑论文" data-edit-publication data-admin-only>
          <i data-lucide="pencil"></i>
        </button>
        <button class="icon-button publication-action danger-action" type="button" aria-label="删除论文" title="删除论文" data-delete-publication data-admin-only>
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <span class="time">${escapeHTML(publication.year)}</span>
      <h3>${escapeHTML(publication.title)}</h3>
      <p>${escapeHTML(publication.meta)}</p>
    `;
    publicationList.appendChild(article);
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return article;
  };

  const rememberDeletedPublication = (publicationId) => {
    if (!publicationId) return;
    const deletedPublications = new Set(readDeletedPublications());
    deletedPublications.add(publicationId);
    writeDeletedPublications([...deletedPublications]);
  };

  const forgetDeletedPublication = (publicationId) => {
    writeDeletedPublications(readDeletedPublications().filter((item) => item !== publicationId));
  };

  const upsertStoredPublication = (publication) => {
    const storedPublications = readStoredPublications();
    const index = storedPublications.findIndex((item) => item.id === publication.id);
    if (index >= 0) {
      storedPublications[index] = publication;
      writeStoredPublications(storedPublications);
      return;
    }
    writeStoredPublications([...storedPublications, publication]);
  };

  const removePublicationRecord = (item) => {
    const publicationId = item?.dataset.publicationId;
    if (!publicationId) return;

    const storedPublications = readStoredPublications();
    const nextStoredPublications = storedPublications.filter((publication) => publication.id !== publicationId);
    const wasStored = nextStoredPublications.length !== storedPublications.length;
    if (wasStored) {
      writeStoredPublications(nextStoredPublications);
    }
    if (!item.dataset.persistedPublication) {
      rememberDeletedPublication(publicationId);
    } else {
      forgetDeletedPublication(publicationId);
    }
    item.remove();
  };

  const deletePublicationItem = (item) => {
    if (!isAdmin) return;
    removePublicationRecord(item);
  };

  const getBlogCards = () => Array.from(document.querySelectorAll(".blog-card[data-blog-id]"));

  const createBlogId = (blog, fallback = Date.now()) => {
    if (blog.id) return blog.id;
    const seed = `${blog.label || "blog"}-${blog.title || fallback}`;
    const slug = seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${slug || "blog"}-${String(fallback).toLowerCase()}`;
  };

  const normalizeBlogURL = (url) => {
    const trimmed = String(url || "").trim();
    if (!trimmed) return "#blog";
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const findBlogCard = (blogId) => getBlogCards().find((card) => card.dataset.blogId === blogId);

  const getBlogData = (card) => ({
    id: card.dataset.blogId,
    label: card.querySelector("span")?.textContent.trim() || "",
    title: card.querySelector("h3")?.textContent.trim() || "",
    description: card.querySelector("p")?.textContent.trim() || "",
    url: card.dataset.blogUrl || "#blog"
  });

  const setBlogCardData = (card, blog) => {
    card.dataset.blogId = createBlogId(blog);
    card.dataset.blogUrl = normalizeBlogURL(blog.url);
    card.setAttribute("aria-label", `打开博客：${blog.title}`);
    const label = card.querySelector("span");
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    if (label) label.textContent = blog.label;
    if (title) title.textContent = blog.title;
    if (description) description.textContent = blog.description;
  };

  const createBlogCard = (blog) => {
    if (!blogList) return null;
    const article = document.createElement("article");
    article.className = "blog-card";
    article.dataset.blogId = createBlogId(blog);
    article.dataset.blogUrl = normalizeBlogURL(blog.url);
    article.setAttribute("role", "link");
    article.setAttribute("tabindex", "0");
    article.setAttribute("aria-label", `打开博客：${blog.title}`);
    if (blog.persisted) {
      article.dataset.persistedBlog = "true";
    }
    article.innerHTML = `
      <div class="blog-actions">
        <button class="icon-button blog-action" type="button" aria-label="编辑博客" title="编辑博客" data-edit-blog data-admin-only>
          <i data-lucide="pencil"></i>
        </button>
        <button class="icon-button blog-action danger-action" type="button" aria-label="删除博客" title="删除博客" data-delete-blog data-admin-only>
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <span>${escapeHTML(blog.label)}</span>
      <h3>${escapeHTML(blog.title)}</h3>
      <p>${escapeHTML(blog.description)}</p>
      <div class="blog-card-footer">
        <strong>查看文章</strong>
        <i data-lucide="arrow-up-right"></i>
      </div>
    `;
    blogList.appendChild(article);
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return article;
  };

  const rememberDeletedBlog = (blogId) => {
    if (!blogId) return;
    const deletedBlogs = new Set(readDeletedBlogs());
    deletedBlogs.add(blogId);
    writeDeletedBlogs([...deletedBlogs]);
  };

  const forgetDeletedBlog = (blogId) => {
    writeDeletedBlogs(readDeletedBlogs().filter((item) => item !== blogId));
  };

  const upsertStoredBlog = (blog) => {
    const storedBlogs = readStoredBlogs();
    const index = storedBlogs.findIndex((item) => item.id === blog.id);
    if (index >= 0) {
      storedBlogs[index] = blog;
      writeStoredBlogs(storedBlogs);
      return;
    }
    writeStoredBlogs([...storedBlogs, blog]);
  };

  const removeBlogRecord = (card) => {
    const blogId = card?.dataset.blogId;
    if (!blogId) return;

    const storedBlogs = readStoredBlogs();
    const nextStoredBlogs = storedBlogs.filter((blog) => blog.id !== blogId);
    const wasStored = nextStoredBlogs.length !== storedBlogs.length;
    if (wasStored) {
      writeStoredBlogs(nextStoredBlogs);
    }
    if (!card.dataset.persistedBlog) {
      rememberDeletedBlog(blogId);
    } else {
      forgetDeletedBlog(blogId);
    }
    card.remove();
  };

  const deleteBlogCard = (card) => {
    if (!isAdmin) return;
    removeBlogRecord(card);
  };

  const openBlogURL = (card) => {
    const url = normalizeBlogURL(card.dataset.blogUrl);
    if (!url) return;
    window.location.href = url;
  };

  const deletedCategories = readDeletedCategories();
  const deletedProjects = readDeletedProjects();

  deletedCategories.forEach((categoryValue) => {
    removeCategoryTab(categoryValue);
    removeCategoryOption(categoryValue);
  });

  getProjectCards()
    .filter((card) => deletedProjects.includes(card.dataset.projectId) || deletedCategories.includes(card.dataset.category))
    .forEach((card) => card.remove());

  const storedCategories = readStoredCategories().filter((category) => !deletedCategories.includes(category.value));
  if (storedCategories.length !== readStoredCategories().length) {
    writeStoredCategories(storedCategories);
  }

  storedCategories.forEach((category) => {
    addCategoryOption(category);
    addCategoryTab(category);
  });

  const storedProjects = readStoredProjects();
  const normalizedStoredProjects = storedProjects.map((project, index) => ({
    ...project,
    id: createProjectId(project, index + 1),
    url: normalizeProjectURL(project.url)
  }));
  if (JSON.stringify(normalizedStoredProjects) !== JSON.stringify(storedProjects)) {
    writeStoredProjects(normalizedStoredProjects);
  }

  normalizedStoredProjects
    .filter((project) => !deletedProjects.includes(project.id) && !deletedCategories.includes(project.category))
    .forEach((project) => {
      const existing = findProjectCard(project.id);
      if (existing) {
        setProjectCardData(existing, project);
        return;
      }
      createProjectCard({ ...project, persisted: true });
    });

  const deletedPublications = readDeletedPublications();
  getPublicationItems()
    .filter((item) => deletedPublications.includes(item.dataset.publicationId))
    .forEach((item) => item.remove());

  const storedPublications = readStoredPublications();
  const normalizedStoredPublications = storedPublications.map((publication, index) => ({
    ...publication,
    id: createPublicationId(publication, index + 1)
  }));
  if (JSON.stringify(normalizedStoredPublications) !== JSON.stringify(storedPublications)) {
    writeStoredPublications(normalizedStoredPublications);
  }

  normalizedStoredPublications
    .filter((publication) => !deletedPublications.includes(publication.id))
    .forEach((publication) => {
      const existing = findPublicationItem(publication.id);
      if (existing) {
        setPublicationItemData(existing, publication);
        return;
      }
      createPublicationItem({ ...publication, persisted: true });
    });

  const deletedBlogs = readDeletedBlogs();
  getBlogCards()
    .filter((card) => deletedBlogs.includes(card.dataset.blogId))
    .forEach((card) => card.remove());

  const storedBlogs = readStoredBlogs();
  const normalizedStoredBlogs = storedBlogs.map((blog, index) => ({
    ...blog,
    id: createBlogId(blog, index + 1),
    url: normalizeBlogURL(blog.url)
  }));
  if (JSON.stringify(normalizedStoredBlogs) !== JSON.stringify(storedBlogs)) {
    writeStoredBlogs(normalizedStoredBlogs);
  }

  normalizedStoredBlogs
    .filter((blog) => !deletedBlogs.includes(blog.id))
    .forEach((blog) => {
      const existing = findBlogCard(blog.id);
      if (existing) {
        setBlogCardData(existing, blog);
        return;
      }
      createBlogCard({ ...blog, persisted: true });
    });

  refreshTabs();
  tabs.forEach(bindFilterTab);
  updateProjectNumbers();

  if (projectScroller) {
    projectScroller.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        projectScroller.scrollBy({ left: event.deltaY, behavior: "smooth" });
      },
      { passive: false }
    );
  }

  if (blogList) {
    blogList.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        blogList.scrollBy({ left: event.deltaY, behavior: "smooth" });
      },
      { passive: false }
    );
  }

  const updateModalLock = () => {
    document.body.classList.toggle("modal-open", Boolean(document.querySelector(".project-modal.is-open")));
  };

  const setModalOpen = (modal, isOpen) => {
    if (!modal) return;
    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
    updateModalLock();
  };

  const closeProjectModal = () => {
    setModalOpen(projectModal, false);
  };

  const closeCategoryModal = () => {
    setModalOpen(categoryModal, false);
  };

  const closePublicationModal = () => {
    setModalOpen(publicationModal, false);
  };

  const closeBlogModal = () => {
    setModalOpen(blogModal, false);
  };

  const closeDeleteModal = () => {
    pendingDeleteAction = null;
    setModalOpen(deleteModal, false);
  };

  const openDeleteModal = ({ message, action }) => {
    if (!isAdmin) return;
    closeProjectModal();
    closeCategoryModal();
    closePublicationModal();
    closeBlogModal();
    pendingDeleteAction = action;
    if (deleteMessage) {
      deleteMessage.textContent = message;
    }
    setModalOpen(deleteModal, true);
    confirmDeleteButton?.focus();
  };

  const openProjectModal = (project = null) => {
    if (!isAdmin) return;
    if (!projectModal || !projectForm) return;
    closeCategoryModal();
    closePublicationModal();
    closeBlogModal();
    closeDeleteModal();

    const isEdit = Boolean(project?.id);
    const defaultProjectCategory = projectCategoryField?.options[0]?.value || "eeg";
    projectForm.reset();
    projectForm.elements.id.value = project?.id || "";
    projectForm.elements.category.value = project?.category || defaultProjectCategory;
    projectForm.elements.title.value = project?.title || "";
    projectForm.elements.description.value = project?.description || "";
    projectForm.elements.url.value = project?.url || "";
    projectForm.elements.meta1.value = project?.meta?.[0] || "";
    projectForm.elements.meta2.value = project?.meta?.[1] || "";
    projectForm.elements.meta3.value = project?.meta?.[2] || "";
    setModalOpen(projectModal, true);
    if (!isEdit && projectCategoryField && activeProjectFilter !== "all") {
      projectCategoryField.value = activeProjectFilter;
    }
    if (projectModalTitle) {
      projectModalTitle.textContent = isEdit ? "编辑项目" : "添加项目";
    }
    if (projectModalEyebrow) {
      projectModalEyebrow.textContent = isEdit ? "Edit Project" : "New Project";
    }
    if (projectSubmitButton) {
      projectSubmitButton.innerHTML = isEdit
        ? '<i data-lucide="save"></i>保存修改'
        : '<i data-lucide="plus"></i>创建项目';
    }
    projectForm.elements.title?.focus();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const openCategoryModal = () => {
    if (!isAdmin) return;
    if (!categoryModal || !categoryForm) return;
    closeProjectModal();
    closePublicationModal();
    closeBlogModal();
    closeDeleteModal();
    setModalOpen(categoryModal, true);
    categoryForm.elements.name?.focus();
  };

  const openPublicationModal = (publication = null) => {
    if (!isAdmin) return;
    if (!publicationModal || !publicationForm) return;
    closeProjectModal();
    closeCategoryModal();
    closeBlogModal();
    closeDeleteModal();

    const isEdit = Boolean(publication?.id);
    publicationForm.reset();
    publicationForm.elements.id.value = publication?.id || "";
    publicationForm.elements.year.value = publication?.year || "";
    publicationForm.elements.title.value = publication?.title || "";
    publicationForm.elements.meta.value = publication?.meta || "";
    if (publicationModalTitle) {
      publicationModalTitle.textContent = isEdit ? "编辑论文" : "添加论文";
    }
    if (publicationModalEyebrow) {
      publicationModalEyebrow.textContent = isEdit ? "Edit Publication" : "New Publication";
    }
    if (publicationSubmitButton) {
      publicationSubmitButton.innerHTML = isEdit
        ? '<i data-lucide="save"></i>保存修改'
        : '<i data-lucide="plus"></i>创建论文';
    }
    setModalOpen(publicationModal, true);
    publicationForm.elements.year?.focus();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  const openBlogModal = (blog = null) => {
    if (!isAdmin) return;
    if (!blogModal || !blogForm) return;
    closeProjectModal();
    closeCategoryModal();
    closePublicationModal();
    closeDeleteModal();

    const isEdit = Boolean(blog?.id);
    blogForm.reset();
    blogForm.elements.id.value = blog?.id || "";
    blogForm.elements.label.value = blog?.label || "";
    blogForm.elements.title.value = blog?.title || "";
    blogForm.elements.description.value = blog?.description || "";
    blogForm.elements.url.value = blog?.url || "";
    if (blogModalTitle) {
      blogModalTitle.textContent = isEdit ? "编辑博客" : "添加博客";
    }
    if (blogModalEyebrow) {
      blogModalEyebrow.textContent = isEdit ? "Edit Blog" : "New Blog";
    }
    if (blogSubmitButton) {
      blogSubmitButton.innerHTML = isEdit ? '<i data-lucide="save"></i>保存修改' : '<i data-lucide="plus"></i>创建博客';
    }
    setModalOpen(blogModal, true);
    blogForm.elements.label?.focus();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  document.querySelectorAll("[data-open-project-modal]").forEach((button) => {
    button.addEventListener("click", openProjectModal);
  });

  document.querySelector("[data-open-category-modal]")?.addEventListener("click", openCategoryModal);
  document.querySelector("[data-open-publication-modal]")?.addEventListener("click", () => openPublicationModal());
  document.querySelector("[data-open-blog-modal]")?.addEventListener("click", () => openBlogModal());
  document.querySelector("[data-close-project-modal]")?.addEventListener("click", closeProjectModal);
  document.querySelector("[data-close-category-modal]")?.addEventListener("click", closeCategoryModal);
  document.querySelector("[data-close-publication-modal]")?.addEventListener("click", closePublicationModal);
  document.querySelector("[data-close-blog-modal]")?.addEventListener("click", closeBlogModal);
  document.querySelectorAll("[data-cancel-delete]").forEach((button) => {
    button.addEventListener("click", closeDeleteModal);
  });

  confirmDeleteButton?.addEventListener("click", () => {
    pendingDeleteAction?.();
    closeDeleteModal();
  });

  projectModal?.addEventListener("click", (event) => {
    if (event.target === projectModal) {
      closeProjectModal();
    }
  });

  categoryModal?.addEventListener("click", (event) => {
    if (event.target === categoryModal) {
      closeCategoryModal();
    }
  });

  publicationModal?.addEventListener("click", (event) => {
    if (event.target === publicationModal) {
      closePublicationModal();
    }
  });

  blogModal?.addEventListener("click", (event) => {
    if (event.target === blogModal) {
      closeBlogModal();
    }
  });

  deleteModal?.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (projectModal?.classList.contains("is-open")) {
      closeProjectModal();
    }
    if (categoryModal?.classList.contains("is-open")) {
      closeCategoryModal();
    }
    if (publicationModal?.classList.contains("is-open")) {
      closePublicationModal();
    }
    if (blogModal?.classList.contains("is-open")) {
      closeBlogModal();
    }
    if (deleteModal?.classList.contains("is-open")) {
      closeDeleteModal();
    }
  });

  projectTabs?.addEventListener("contextmenu", (event) => {
    if (!isAdmin) return;
    const tab = event.target.closest("[data-filter]");
    if (!tab || tab.dataset.filter === "all") return;

    event.preventDefault();
    const categoryValue = tab.dataset.filter;
    const categoryLabel = tab.textContent.trim() || categoryValue;
    const projectCount = getProjectCards().filter((card) => card.dataset.category === categoryValue).length;
    const message =
      projectCount > 0
        ? `确认删除分类「${categoryLabel}」吗？这个分类下的 ${projectCount} 个项目也会一起删除。`
        : `确认删除分类「${categoryLabel}」吗？`;
    openDeleteModal({
      message,
      action: () => deleteCategory(categoryValue)
    });
  });

  projectScroller?.addEventListener("contextmenu", (event) => {
    if (!isAdmin) return;
    const card = event.target.closest(".project-card");
    if (!card) return;

    event.preventDefault();
    const projectTitle = card.querySelector("h3")?.textContent.trim() || "这个项目";
    openDeleteModal({
      message: `确认删除项目「${projectTitle}」吗？`,
      action: () => deleteProjectCard(card)
    });
  });

  projectScroller?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-project]");
    const deleteButton = event.target.closest("[data-delete-project]");
    const card = event.target.closest(".project-card[data-project-id]");
    if (!card) return;

    if (editButton || deleteButton) {
      if (!isAdmin) return;
      event.preventDefault();
      event.stopPropagation();
      if (editButton) {
        openProjectModal(getProjectData(card));
        return;
      }

      const projectTitle = card.querySelector("h3")?.textContent.trim() || "这个项目";
      openDeleteModal({
        message: `确认删除项目「${projectTitle}」吗？`,
        action: () => deleteProjectCard(card)
      });
      return;
    }

    openProjectURL(card);
  });

  projectScroller?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("button")) return;
    const card = event.target.closest(".project-card[data-project-id]");
    if (!card) return;
    event.preventDefault();
    openProjectURL(card);
  });

  publicationList?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-publication]");
    const deleteButton = event.target.closest("[data-delete-publication]");
    const item = event.target.closest(".timeline-item[data-publication-id]");
    if (!item || (!editButton && !deleteButton)) return;
    if (!isAdmin) return;

    event.preventDefault();
    if (editButton) {
      openPublicationModal(getPublicationData(item));
      return;
    }

    const publicationTitle = item.querySelector("h3")?.textContent.trim() || "这篇论文";
    openDeleteModal({
      message: `确认删除论文「${publicationTitle}」吗？`,
      action: () => deletePublicationItem(item)
    });
  });

  blogList?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-blog]");
    const deleteButton = event.target.closest("[data-delete-blog]");
    const card = event.target.closest(".blog-card[data-blog-id]");
    if (!card) return;

    if (editButton || deleteButton) {
      if (!isAdmin) return;
      event.preventDefault();
      event.stopPropagation();
      if (editButton) {
        openBlogModal(getBlogData(card));
        return;
      }

      const blogTitle = card.querySelector("h3")?.textContent.trim() || "这篇博客";
      openDeleteModal({
        message: `确认删除博客「${blogTitle}」吗？`,
        action: () => deleteBlogCard(card)
      });
      return;
    }

    openBlogURL(card);
  });

  blogList?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("button")) return;
    const card = event.target.closest(".blog-card[data-blog-id]");
    if (!card) return;
    event.preventDefault();
    openBlogURL(card);
  });

  categoryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(categoryForm);
    const category = createCategoryFromName(formData.get("name"));
    if (!category) return;

    if (!category.existing) {
      forgetDeletedCategory(category.value);
      addCategoryOption(category);
      addCategoryTab(category);
      const storedCategories = readStoredCategories();
      const exists = storedCategories.some((item) => item.value === category.value);
      if (!exists) {
        writeStoredCategories([...storedCategories, { value: category.value, label: category.label }]);
      }
    }

    refreshTabs();
    setActiveProjectFilter(category.value);
    categoryForm.reset();
    closeCategoryModal();
  });

  publicationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(publicationForm);
    const existingId = String(formData.get("id") || "").trim();
    const publication = {
      id:
        existingId ||
        createPublicationId(
          {
            year: formData.get("year"),
            title: formData.get("title")
          },
          Date.now()
        ),
      year: String(formData.get("year") || "").trim(),
      title: String(formData.get("title") || "").trim(),
      meta: String(formData.get("meta") || "").trim()
    };

    const existing = findPublicationItem(publication.id);
    const item = existing || createPublicationItem({ ...publication, persisted: true });
    if (item) {
      setPublicationItemData(item, publication);
      upsertStoredPublication(publication);
      forgetDeletedPublication(publication.id);
      window.setTimeout(() => item.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    }

    publicationForm.reset();
    closePublicationModal();
  });

  blogForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(blogForm);
    const existingId = String(formData.get("id") || "").trim();
    const blog = {
      id:
        existingId ||
        createBlogId(
          {
            label: formData.get("label"),
            title: formData.get("title")
          },
          Date.now()
        ),
      label: String(formData.get("label") || "").trim(),
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      url: normalizeBlogURL(formData.get("url"))
    };

    const existing = findBlogCard(blog.id);
    const card = existing || createBlogCard({ ...blog, persisted: true });
    if (card) {
      setBlogCardData(card, blog);
      upsertStoredBlog(blog);
      forgetDeletedBlog(blog.id);
      window.setTimeout(() => card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" }), 120);
    }

    blogForm.reset();
    closeBlogModal();
  });

  projectForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    const formData = new FormData(projectForm);
    const existingId = String(formData.get("id") || "").trim();
    const project = {
      id:
        existingId ||
        createProjectId(
          {
            title: formData.get("title"),
            category: formData.get("category")
          },
          Date.now()
        ),
      category: String(formData.get("category") || "").trim(),
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      meta: [formData.get("meta1"), formData.get("meta2"), formData.get("meta3")]
        .map((item) => String(item || "").trim())
        .filter(Boolean),
      url: normalizeProjectURL(formData.get("url"))
    };

    const existing = findProjectCard(project.id);
    const card = existing || createProjectCard({ ...project, persisted: true });
    if (card) {
      setProjectCardData(card, project);
      upsertStoredProject(project);
      forgetDeletedProject(project.id);
      setActiveProjectFilter(project.category);
      window.setTimeout(() => card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" }), 120);
    }

    projectForm.reset();
    closeProjectModal();
  });

  setActiveProjectFilter("all");

  const copyMail = document.querySelector("[data-email]");
  if (copyMail) {
    copyMail.addEventListener("click", async () => {
      const email = copyMail.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        copyMail.lastChild.textContent = " 已复制";
      } catch {
        copyMail.lastChild.textContent = ` ${email}`;
      }
      window.setTimeout(() => {
        copyMail.lastChild.textContent = " 复制邮箱";
      }, 1800);
    });
  }

  const canvas = document.getElementById("signalCanvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawWave = (offset, color, amplitude, speed) => {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const y =
          height * offset +
          Math.sin(x * 0.012 + time * speed) * amplitude +
          Math.sin(x * 0.026 + time * speed * 0.6) * amplitude * 0.38;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);
      drawWave(0.22, "rgba(66, 214, 217, 0.24)", 16, 2.1);
      drawWave(0.52, "rgba(240, 179, 91, 0.16)", 24, 1.55);
      drawWave(0.78, "rgba(155, 227, 106, 0.14)", 18, 1.8);
      requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    render();
  }

  const heroWaveCanvas = document.getElementById("heroWaveCanvas");

  if (heroWaveCanvas && !reduceMotion) {
    const heroCtx = heroWaveCanvas.getContext("2d");
    let heroWidth = 0;
    let heroHeight = 0;
    let heroTime = 0;

    const resizeHeroWave = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = heroWaveCanvas.getBoundingClientRect();
      heroWidth = rect.width;
      heroHeight = rect.height;
      heroWaveCanvas.width = Math.floor(heroWidth * ratio);
      heroWaveCanvas.height = Math.floor(heroHeight * ratio);
      heroCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawHeroWave = (offset, color, amplitude, speed) => {
      heroCtx.beginPath();
      for (let x = 0; x <= heroWidth; x += 8) {
        const y =
          heroHeight * offset +
          Math.sin(x * 0.012 + heroTime * speed) * amplitude +
          Math.sin(x * 0.026 + heroTime * speed * 0.6) * amplitude * 0.38;
        if (x === 0) {
          heroCtx.moveTo(x, y);
        } else {
          heroCtx.lineTo(x, y);
        }
      }
      heroCtx.strokeStyle = color;
      heroCtx.lineWidth = 1;
      heroCtx.stroke();
    };

    const renderHeroWave = () => {
      heroTime += 0.012;
      heroCtx.clearRect(0, 0, heroWidth, heroHeight);
      drawHeroWave(0.32, "rgba(66, 214, 217, 0.28)", 18, 2.1);
      drawHeroWave(0.58, "rgba(240, 179, 91, 0.16)", 26, 1.55);
      drawHeroWave(0.76, "rgba(86, 230, 240, 0.16)", 20, 1.8);
      requestAnimationFrame(renderHeroWave);
    };

    resizeHeroWave();
    window.addEventListener("resize", resizeHeroWave, { passive: true });
    renderHeroWave();
  }
})();
