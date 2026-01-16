#!/bin/bash

# Script para fazer push do projeto para o GitHub
# Execute este script no seu terminal: ./push-to-github.sh

set -e

echo "🚀 Configurando DevKit - Multi-Tenancy & RBAC"
echo "=========================================="
echo ""
echo "Este script vai:"
echo "1. Verificar o status do git"
echo "2. Fazer push para o GitHub"
echo "3. Você precisará autenticar com suas credenciais do GitHub"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Diretório .git não encontrado"
    echo "   Execute este script a partir da raiz do projeto"
    exit 1
fi

echo "✅ Diretório git encontrado"
echo ""

# Mostrar status
echo "📊 Status do repositório:"
git status -s | head -10
echo "..."

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo ""
    echo "⚠️  Você não está no branch main"
    read -p "Deseja mudar para main? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    fi
fi

echo ""
echo "🔜 Preparando para push..."
echo "   Remote: origin"
echo "   Branch: main"
echo "   URL: https://github.com/edsonmartins/usedevkit.git"
echo ""

read -p "Pressione ENTER para continuar..."

# Fazer o push
echo ""
echo "⬆️  Fazendo push para o GitHub..."
echo ""

if git push -u origin main; then
    echo ""
    echo "✅ Sucesso! Projeto enviado para o GitHub!"
    echo ""
    echo "🌐 Acesse: https://github.com/edsonmartins/usedevkit"
    echo ""
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo ""
    echo "Possíveis soluções:"
    echo "1. Verifique suas credenciais do GitHub"
    echo "2. Crie um Personal Access Token: https://github.com/settings/tokens"
    echo "3. Use o token como senha quando solicitado"
    echo "4. Ou configure SSH: git remote set-url origin git@github.com:edsonmartins/usedevkit.git"
    echo ""
    exit 1
fi
