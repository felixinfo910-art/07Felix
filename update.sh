#!/bin/bash
# ===================================================================
# Felix 管理者工作台 - 宝塔一键热更新脚本 (适合宝塔终端或定时任务)
# ===================================================================

echo "--------------------------------------------------------"
echo "🚀 正在从远程 Git 仓库同步最新代码..."
echo "--------------------------------------------------------"

git fetch --all --prune
git reset --hard origin/main

if [ $? -eq 0 ]; then
    CURRENT_COMMIT=$(git log -1 --pretty=format:"%h - %s (%cd)" --date=format:"%Y-%m-%d %H:%M")
    echo "✅ 源码已成功对齐 GitHub 最新版本！"
    echo "📌 当前生效版本: $CURRENT_COMMIT"
else
    echo "⚠️ Git 同步异常，请检查网络或 SSH 密钥。"
    exit 1
fi

echo "🔒 正在自动修复宝塔站点运行权限与所有者..."
# 宝塔防跨站文件 .user.ini 拥有不可变属性(chattr +i)，忽略其权限警告
chown -R www:www . 2>/dev/null || true
chmod -R 755 . 2>/dev/null || true
chmod -R 777 data uploads 2>/dev/null || true

# 如果开启了 PHP OPcache，主动调用平滑重载以立即生效新代码
which systemctl >/dev/null 2>&1 && (systemctl reload php-fpm || systemctl reload php-fpm-74 || true) 2>/dev/null

echo "--------------------------------------------------------"
echo "🎉 部署更新完成！最新版本已成功生效。"
echo "💡 提示：按 Ctrl + F5 强制刷新浏览器即可无感体验新特性。"
echo "--------------------------------------------------------"
