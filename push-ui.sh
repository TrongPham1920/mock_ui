#!/usr/bin/env bash
# Deploy ride-ops-dashboard/ -> origin/main (mock_ui)
# Local giữ nguyên cấu trúc, chỉ subfolder ride-ops-dashboard/ được đẩy lên web public.
set -e

PREFIX="ride-ops-dashboard"
REMOTE="origin"
BRANCH="main"

# Bảo đảm đã commit thay đổi
if ! git diff --quiet -- "$PREFIX" || ! git diff --cached --quiet -- "$PREFIX"; then
  echo "⚠️  Còn thay đổi chưa commit trong $PREFIX/. Commit trước rồi chạy lại:"
  echo "    git add $PREFIX && git commit -m 'update'"
  exit 1
fi

echo "📦 Tách subtree $PREFIX/ ..."
git subtree split --prefix="$PREFIX" -b _deploy >/dev/null

echo "🚀 Force-push lên $REMOTE/$BRANCH ..."
git push "$REMOTE" _deploy:"$BRANCH" --force

git branch -D _deploy >/dev/null
echo "✅ Đã deploy. Site sẽ tự cập nhật sau ~1 phút."
