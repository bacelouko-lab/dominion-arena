# 🐉 DOMINION ARENA TÁTICA - ESPECIFICAÇÕES DO JOGO

## 📊 Resumo Geral

- **Total de Cartas:** 40
- **Classes:** 7 (Guerreiro, Mago, Ladino, Suporte, Monstro, Mercador, Dragão)
- **Regiões:** 6 (Vulcão, Montanha, Céu, Lago, Floresta, Deserto)
- **Custos Disponíveis:** 2, 3, 4, 8 (Dragões exclusivamente custo 8)
- **Dragões Raros:** 2 cartas únicas

---

## 📈 DISTRIBUIÇÃO DE CARTAS

### Por Classe:
- **Guerreiro:** 6 cartas
- **Mago:** 7 cartas
- **Ladino:** 7 cartas
- **Suporte:** 6 cartas
- **Monstro:** 6 cartas
- **Mercador:** 6 cartas
- **Dragão:** 2 cartas

### Por Região:
- **Vulcão:** 7 cartas
- **Montanha:** 4 cartas
- **Céu:** 6 cartas
- **Lago:** 7 cartas
- **Floresta:** 10 cartas
- **Deserto:** 6 cartas

### Por Custo:
- **Custo 2 (Comum):** 14 cartas
- **Custo 3 (Incomum):** 11 cartas
- **Custo 4 (Raro):** 13 cartas
- **Custo 8 (Dragões Raros):** 2 cartas

---

## ⚔️ TABELA DE STATS POR CUSTO

### 💰 Custo 2 (Iniciante)

| Métrica | Mínimo | Máximo | Média |
|---------|--------|--------|-------|
| **ATK** | 1 | 6 | 3.2 |
| **DEF** | 2 | 6 | 3.4 |

**Quantidade:** 14 cartas

### 💰 Custo 3 (Médio)

| Métrica | Mínimo | Máximo | Média |
|---------|--------|--------|-------|
| **ATK** | 3 | 8 | 5.3 |
| **DEF** | 2 | 6 | 4.3 |

**Quantidade:** 11 cartas

### ⭐ Custo 4 (Forte)

| Métrica | Mínimo | Máximo | Média |
|---------|--------|--------|-------|
| **ATK** | 5 | 10 | 7.5 |
| **DEF** | 4 | 9 | 6.4 |

**Quantidade:** 13 cartas

### 🐉 Custo 8 (Dragões)

| Métrica | Mínimo | Máximo | Média |
|---------|--------|--------|-------|
| **ATK** | 10 | 15 | 12.5 |
| **DEF** | 8 | 12 | 10.0 |

**Quantidade:** 2 cartas


---

## 🎯 HABILIDADES POR CLASSE

### Guerreiro (6 cartas)

**Descrição:** Especialistas em combate direto com alto ATK. Recebem bônus em ATK mas redução em habilidades especiais.

**Exemplo de Habilidades:**
- +2 ATK ao evoluir
- +3 ATK contra monstros
- Dano duplicado em combos
- Regenera 2 DEF a cada turno

### Mago (7 cartas)

**Descrição:** Usuários de magia com enfoque em controle e dano especial. DEF reduzido, ATK ligeiramente menor.

**Exemplo de Habilidades:**
- Duplica habilidade especial
- Inverte DEF do inimigo
- Dano mágico ignora 20% DEF
- Gera cristal extra

### Ladino (7 cartas)

**Descrição:** Especialistas em ataque rápido e crítico. ATK altíssimo com DEF baixo.

**Exemplo de Habilidades:**
- Ignora 30% de DEF
- Ataque crítico com 40% chance
- Roubo de 1 ouro do inimigo
- Evasão de 25%

### Suporte (6 cartas)

**Descrição:** Personagens defensivos que ajudam aliados. Alto DEF com ATK reduzido.

**Exemplo de Habilidades:**
- +3 de vida ao evoluir
- +2 DEF para aliados
- Cura 3 vidas por turno
- Escudo de barreira

### Monstro (6 cartas)

**Descrição:** Criaturas selvagens com ATK alto e capacidades especiais de dano.

**Exemplo de Habilidades:**
- +4 de dano
- Ganha força com baixa vida
- Dano aumentado 50% à noite
- Multiplicador de dano x1.5

### Mercador (6 cartas)

**Descrição:** Especialistas em economia e ganhos. Reduzem custos e aumentam lucros.

**Exemplo de Habilidades:**
- -1 de custo em cartas
- +2 ouro por venda
- Desconto em compras
- Duplica valor de itens

### Dragão (2 cartas)

**Descrição:** Criaturas lendárias e raríssimas. Custo 8, stats muito altos e habilidades especiais únicas.

**Exemplo de Habilidades:**
- Voo: ignora obstáculos
- Bafo de fogo: dano em área
- Imortal: ressurge com 50% vida


---

## 🐉 DRAGÕES (CARTAS RARAS)

### Dragão Ancestral do Vulcão

- **ID:** 37
- **Região:** Deserto
- **Custo:** 8 (Ouro/Cristais)
- **ATK:** 15 ⚔️
- **DEF:** 8 🛡️
- **Habilidade Especial:** Imortal: ressurge com 50% vida

### Dragão Celestial Imortal

- **ID:** 38
- **Região:** Lago
- **Custo:** 8 (Ouro/Cristais)
- **ATK:** 10 ⚔️
- **DEF:** 12 🛡️
- **Habilidade Especial:** Imortal: ressurge com 50% vida


---

## 🎮 ESTRATÉGIAS DE DECK

### Deck Agressivo (Guerreiro/Ladino)
- 2-3 Guerreiros de custo 4 (ATK alto)
- 2-3 Ladrões de custo 3-4 (criticalidade)
- 1-2 Monstros de custo 3 (dano adicional)
- Total: 5-8 cartas (custo 15-25)

### Deck Controlador (Mago/Suporte)
- 2-3 Magos de custo 3-4 (controle)
- 2-3 Suportes de custo 3-4 (defesa)
- 1 Mercador de custo 3 (economia)
- Total: 5-7 cartas (custo 15-23)

### Deck Econômico (Mercador)
- 3-4 Mercadores de custo 2-3 (renda)
- 2-3 cartas suporte (1 Suporte, 1 Mago)
- 1 carta de ataque (Guerreiro ou Ladino)
- Total: 6-8 cartas (custo 12-20)

### Deck Balanceado
- 1-2 Guerreiros (ataque)
- 1-2 Magos (controle)
- 1-2 Ladrões (crítico)
- 1-2 Suportes (defesa)
- 1 Mercador (economia)
- Total: 5-9 cartas (custo 15-30)

---

## 💡 BALANCEAMENTO DO JOGO

### Curva de Poder
```
Custo 2: 3.2 ATK / 3.4 DEF (fraco, rápido)
Custo 3: 5.3 ATK / 4.3 DEF (médio, rápido)
Custo 4: 7.5 ATK / 6.4 DEF (forte, lento)
Custo 8: 12.5 ATK / 10.0 DEF (legendário, muito lento)
```

### Princípios de Design
1. **Cartas de custo baixo são fracas mas rápidas de jogar**
2. **Cartas de custo alto são poderosas mas requerem economia**
3. **Dragões são raros (apenas 2) e muito caros para manter equilíbrio**
4. **Cada classe tem enfoque diferente (ATK, DEF, Controle, Economia)**
5. **Habilidades são únicas por classe para variedade tática**

---

## 📝 ESTRUTURA DO JSON

```json
{
  "id": 1,
  "nome": "Nome da Carta",
  "regiao": "Uma das 6 regiões",
  "classe": "Uma das 7 classes",
  "custo": 2,
  "atk": 3,
  "def": 3,
  "habilidade_descricao": "Descrição da habilidade especial"
}
```

### Campos:
- **id** (1-40): Identificador único
- **nome**: Nome descritivo da carta
- **regiao**: Uma de [Vulcão, Montanha, Céu, Lago, Floresta, Deserto]
- **classe**: Uma de [Guerreiro, Mago, Ladino, Suporte, Monstro, Mercador, Dragão]
- **custo**: 2, 3, 4 ou 8 (ouro/cristais necessários para jogar)
- **atk**: Ataque (1-15)
- **def**: Defesa (1-12)
- **habilidade_descricao**: Texto descritivo da habilidade especial

---

## 🔧 COMO USAR

### Para Desenvolvedores:
1. Carregue `dominion_cards.json` no seu jogo
2. Use o filtro de `classe`, `regiao` ou `custo` para criar decks
3. Implemente habilidades baseado em `habilidade_descricao`

### Para Jogadores:
1. Abra `dominion_cards_viewer.html` no navegador
2. Filtre cartas por classe, região ou custo
3. Alterne entre visualização em grid e tabela
4. Analise stats para montar estratégias

---

**Data de Criação:** 2 de Abril de 2026
**Versão:** 1.0 Balanceada
**Status:** Pronto para Uso
