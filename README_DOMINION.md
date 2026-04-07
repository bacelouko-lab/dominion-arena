# 🐉 Dominion Arena Tática - Guia de Uso

## 📦 O Que Você Recebeu

Foram gerados **3 arquivos principais** para o seu jogo Dominion Arena Tática:

### 1. **dominion_cards.json** 📄
Arquivo JSON com as 40 cartas balanceadas. Estrutura:
```json
{
  "id": 1,
  "nome": "Cavaleiro da Honra",
  "regiao": "Floresta",
  "classe": "Guerreiro",
  "custo": 2,
  "atk": 3,
  "def": 3,
  "habilidade_descricao": "+2 ATK ao evoluir"
}
```

**Uso:**
- Importe em seu backend/banco de dados
- Use para popular um banco de dados relacional
- Integre com APIs REST
- Carregue em aplicativos mobile/web

### 2. **dominion_cards_viewer.html** 🌐
Visualizador interativo das cartas no navegador.

**Recursos:**
- ✨ Grid responsivo com cartas
- 🔍 Filtros por classe, região e custo
- 📊 Visualização em tabela
- 🎨 Design temático (tema escuro/dourado)
- 🐉 Destaque para dragões raros

**Como usar:**
1. Abra o arquivo em qualquer navegador
2. Use os filtros no topo para explorar
3. Alterne entre visualizações (grid/tabela)
4. Clique nas cartas para mais detalhes (em grid)

### 3. **dominion_especificacoes.md** 📚
Documentação completa com:
- Balanceamento por custo
- Estratégias de deck
- Descrição de classes
- Guia de desenvolvimento

---

## 📊 Distribuição das Cartas

| Classe | Quantidade | ATK Médio | DEF Médio |
|--------|-----------|-----------|-----------|
| Guerreiro | 6 | ~6 | ~4 |
| Mago | 7 | ~4 | ~4 |
| Ladino | 7 | ~6 | ~4 |
| Suporte | 6 | ~4 | ~6 |
| Monstro | 6 | ~7 | ~4 |
| Mercador | 6 | ~4 | ~3 |
| **Dragão** | **2** | **12.5** | **10** |

### Por Custo

| Custo | Quantidade | Tipo | ATK Range | DEF Range |
|-------|-----------|------|-----------|-----------|
| 2 | 14 | Comum | 1-6 | 2-6 |
| 3 | 11 | Incomum | 3-8 | 2-6 |
| 4 | 13 | Raro | 5-10 | 4-9 |
| 8 | 2 | Legendário | 10-15 | 8-12 |

### Por Região

| Região | Quantidade |
|--------|-----------|
| Vulcão | 7 |
| Montanha | 4 |
| Céu | 6 |
| Lago | 7 |
| Floresta | 10 |
| Deserto | 6 |

---

## 🎮 Exemplos de Uso

### Desenvolvimento Backend (Node.js/Express)
```javascript
const cartas = require('./dominion_cards.json');

// Obter todas as cartas de Guerreiro
const guerreiros = cartas.filter(c => c.classe === 'Guerreiro');

// Obter cartas de custo 3
const mid_tier = cartas.filter(c => c.custo === 3);

// Obter dragões
const dragoes = cartas.filter(c => c.classe === 'Dragão');
```

### Python/Django
```python
import json

with open('dominion_cards.json', 'r', encoding='utf-8') as f:
    cartas = json.load(f)

# Criar fixture para Django
from django.core import serializers

# Processar cartas
for carta in cartas:
    Card.objects.create(
        id=carta['id'],
        nome=carta['nome'],
        regiao=carta['regiao'],
        classe=carta['classe'],
        custo=carta['custo'],
        atk=carta['atk'],
        def_value=carta['def'],
        habilidade=carta['habilidade_descricao']
    )
```

### SQL (PostgreSQL/MySQL)
```sql
CREATE TABLE cards (
  id INT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  regiao VARCHAR(50),
  classe VARCHAR(50),
  custo INT,
  atk INT,
  def INT,
  habilidade_descricao TEXT
);

-- Importar do JSON
-- Use ferramentas como pgAdmin, MySQL Workbench ou scripts de importação
```

### React/Vue
```javascript
import cartas from './dominion_cards.json';

// Componente React
function CardList() {
  const [filtroClasse, setFiltroClasse] = useState('');
  
  const cartasFiltradas = filtroClasse 
    ? cartas.filter(c => c.classe === filtroClasse)
    : cartas;

  return (
    <div className="cards">
      {cartasFiltradas.map(carta => (
        <Card key={carta.id} carta={carta} />
      ))}
    </div>
  );
}
```

---

## 🔧 Personalizações Recomendadas

### 1. Adicionar Imagens
```json
{
  "id": 1,
  "nome": "Cavaleiro da Honra",
  "...": "...",
  "imagem": "cards/guerreiro_1.png",
  "imagem_full": "cards/full/guerreiro_1_full.png"
}
```

### 2. Adicionar Raritário/Qualidade
```json
{
  "id": 1,
  "...": "...",
  "raridade": "comum",
  "qualidade": "normal"
}
```

### 3. Adicionar Sinergia de Classe
```json
{
  "id": 1,
  "...": "...",
  "sinergia": {
    "guerreiro": 0.1,
    "monstro": 0.2
  }
}
```

### 4. Adicionar Efeitos/Animações
```json
{
  "id": 1,
  "...": "...",
  "efeitos": [
    "brilho",
    "levitacao"
  ]
}
```

---

## 📱 Deployment

### HTML Viewer
1. Hospede em qualquer servidor web estático
2. AWS S3, GitHub Pages, Netlify, Vercel
3. Sem dependências, funciona offline

### JSON
1. Hospede em um CDN
2. Integre com banco de dados
3. Use em APIs REST

---

## ✅ Checklist de Implementação

- [ ] Importar JSON no banco de dados
- [ ] Criar modelos/tabelas para cartas
- [ ] Criar endpoints de API para obter cartas
- [ ] Implementar sistema de decks
- [ ] Integrar visualizador HTML
- [ ] Adicionar imagens das cartas
- [ ] Implementar sistema de batalha
- [ ] Adicionar efeitos de som/animação
- [ ] Testar balanceamento
- [ ] Deploy em produção

---

## 🐛 Troubleshooting

**P: As cartas não carregam no HTML?**
R: Certifique-se de que o navegador tem acesso ao arquivo HTML. Teste em HTTP local.

**P: Como carregar o JSON em meu banco de dados?**
R: Use scripts de importação específicos do seu banco (mongoimport, mysql, psql).

**P: Posso modificar as cartas?**
R: Sim! Edite dominion_cards.json diretamente com um editor de texto.

**P: Como adicionar novas cartas?**
R: Copie uma carta existente, mude o ID e os valores.

---

## 📞 Suporte

Para dúvidas sobre:
- **Balanceamento**: Veja dominion_especificacoes.md
- **Estrutura**: Verifique a documentação JSON
- **Visualização**: Abra dominion_cards_viewer.html
- **Desenvolvimento**: Consulte exemplos acima

---

**Versão:** 1.0
**Data:** 2 de Abril de 2026
**Status:** ✅ Pronto para Produção
