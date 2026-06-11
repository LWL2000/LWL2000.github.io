# 个人网站部署方案

这个站点是纯静态网站，入口文件是 `index.html`。只要服务器能托管静态文件，就可以部署。

## 目录

```text
personal-site/
├─ index.html
├─ assets/
│  ├─ css/styles.css
│  ├─ js/main.js
│  └─ images/hero-neural-bci.png
└─ DEPLOY.md
```
V
## 本地服务器方案

### 快速预览

在站点目录运行：

```powershell
cd C:\Users\pc\Documents\Codex\2026-06-10\home-about-projects-eeg-ssvep-vla\outputs\personal-site
python -m http.server 8080
```

本机访问：

```text
http://127.0.0.1:8080
```

同一局域网朋友访问：

```text
http://你的局域网IP:8080
```

Windows 查看局域网 IP：

```powershell
ipconfig
```

如果朋友无法访问，检查 Windows 防火墙是否允许 8080 端口入站。

### Nginx 生产部署

把 `personal-site` 整个目录上传到服务器：

```bash
sudo mkdir -p /var/www/personal-site
sudo rsync -av ./personal-site/ /var/www/personal-site/
```

新建 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/personal-site;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(css|js|png|jpg|jpeg|webp|ico)$ {
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

启用并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

配置 HTTPS 推荐使用 Certbot：

```bash
sudo certbot --nginx -d your-domain.com
```

## GitHub Pages 方案

### 方法一：个人主页仓库

1. 在 GitHub 新建仓库：`你的GitHub用户名.github.io`
2. 把 `personal-site` 目录里的内容上传到仓库根目录。
3. 访问：

```text
https://你的GitHub用户名.github.io/
```

### 方法二：普通仓库 Pages

1. 新建任意仓库，例如 `personal-website`。
2. 把 `personal-site` 目录里的内容上传到仓库根目录。
3. 打开仓库 `Settings -> Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`。
6. 访问：

```text
https://你的GitHub用户名.github.io/personal-website/
```

### 命令行上传示例

```bash
cd personal-site
git init
git add .
git commit -m "Initial personal website"
git branch -M main
git remote add origin https://github.com/你的GitHub用户名/personal-website.git
git push -u origin main
```

## 上线前替换清单

- `index.html` 里的 `你的名字`
- `name@example.com`
- GitHub / Google Scholar 链接
- 论文标题、作者和期刊会议
- 教育经历、研究经历、简历链接
- 项目的真实图片、视频或论文链接
