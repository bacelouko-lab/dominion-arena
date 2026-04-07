# 🎮 Dominion Arena Tática - Guia Completo de Jogo

Bem-vindo ao **Dominion Arena Tática**! Este é um guia completo para ajudá-lo a instalar, executar e dominar o jogo. Não se preocupe se você não tem experiência com programação - este guia foi feito para ser simples e direto.

---

## 1️⃣ INÍCIO RÁPIDO

Se você quer começar **imediatamente**, siga estes passos:

### Passo 1: Preparar o Ambiente
```bash
# Abra o terminal e navegue até a pasta do jogo
cd /caminho/para/dominion_arena_tatica

# Execute o script de inicialização
bash start.sh
```

### Passo 2: Aguardar a Inicialização
O script irá:
- ✅ Instalar todas as dependências necessárias
- ✅ Iniciar o banco de dados (Docker)
- ✅ Rodar o servidor backend
- ✅ Rodar o frontend

### Passo 3: Acessar o Jogo
Abra seu navegador (Chrome, Firefox, Safari, Edge) e vá para:
```
http://localhost:3000
```

**Pronto!** Você verá o menu principal do jogo. 🎉

---

## 2️⃣ REQUISITOS DO SISTEMA

Antes de instalar, certifique-se que seu computador tem:

### Software Necessário
- **Node.js** versão 16 ou superior
- **npm** (gerenciador de pacotes - vem com Node.js)
- **Docker** (para rodar o banco de dados)
- **Git** (para clonar o projeto)

### Como Verificar se Você Tem Tudo Instalado?

Abra o terminal e digite estes comandos:

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Docker
docker --version

# Verificar Git
git --version
```

Se todos retornarem versões, você está pronto! ✅

Se algum não aparecer, você pode instalar:
- **Node.js + npm**: Visite https://nodejs.org/
- **Docker**: Visite https://www.docker.com/
- **Git**: Visite https://git-scm.com/

### Requisitos de Hardware
- **Processador**: Qualquer processador moderno
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Espaço em disco**: 2GB livres
- **Conexão**: Internet apenas para instalação inicial

---

## 3️⃣ INSTALAÇÃO E EXECUÇÃO

### Opção A: Instalação Manual (Passo a Passo)

#### Passo 1: Clonar o Projeto
```bash
# Navegue até onde quer guardar o projeto
cd ~/Documentos

# Clone o repositório (ou extraia o arquivo ZIP)
git clone <url-do-repositorio> dominion_arena_tatica
cd dominion_arena_tatica
```

#### Passo 2: Instalar Dependências
```bash
# Instale as dependências do projeto
npm install
```
⏱️ *Isso pode levar 2-5 minutos na primeira vez*

#### Passo 3: Iniciar Docker e Banco de Dados
```bash
# Inicie o Docker
# No Windows/Mac: Abra o aplicativo Docker Desktop
# No Linux: use sudo systemctl start docker

# Inicie o banco de dados
docker-compose up -d
```

#### Passo 4: Iniciar o Backend
Em um novo terminal, na pasta do projeto:
```bash
npm run server
```
Você verá: `✓ Servidor backend rodando na porta 5000`

#### Passo 5: Iniciar o Frontend
Em outro novo terminal, na pasta do projeto:
```bash
npm run client
```
Você verá: `✓ Frontend compilado com sucesso`

#### Passo 6: Acessar o Jogo
Abra seu navegador em:
```
http://localhost:3000
```

---

### Opção B: Instalação Automática (Recomendado)

Se você está no Linux ou Mac, use o script automático:

```bash
# Navegue até a pasta do projeto
cd dominion_arena_tatica

# Execute o script
bash start.sh
```

O script fará tudo automaticamente. Espere até ver:
```
✓ Jogo pronto! Abra: http://localhost:3000
```

### Parar o Jogo
Para encerrar o jogo, pressione `Ctrl+C` em cada terminal (ou use `bash stop.sh`)

---

## 4️⃣ COMO JOGAR

### Entendendo o Jogo

Dominion Arena Tática é um **jogo de estratégia em turnos** onde você coleta cartas poderosas, gerencia recursos (ouro) e batalha contra outros jogadores. Cada turno segue fases específicas que você deve dominar.

---

### 🏠 Menu Inicial

Quando você entra no jogo, verá três opções:

#### **Criar uma Nova Sala**
1. Clique em **"Criar Sala"**
2. Digite um nome para sua sala (ex: "Minha Primeira Partida")
3. Escolha a dificuldade:
   - **Fácil**: Adversários básicos (perfeito para aprender)
   - **Normal**: Desafio moderado
   - **Difícil**: Para jogadores experientes
4. Escolha quantos jogadores: 2, 3 ou 4 jogadores
5. Clique em **"Iniciar"**

#### **Entrar em uma Sala Existente**
1. Clique em **"Entrar em Sala"**
2. Veja a lista de salas disponíveis
3. Clique na sala que quer entrar
4. Aguarde outros jogadores (ou jogue contra IA)

#### **Configurações**
Ajuste som, brilho, idioma e outras preferências

---

### 🎮 Fases do Turno

Cada turno é dividido em **4 fases**. Você SEMPRE segue esta ordem:

#### **FASE 1: OURO ⭐**

Nesta fase você ganha ouro (moeda do jogo):

```
Como funciona:
  • Todas as cartas no seu "Campo" geram ouro
  • Cada carta tem um valor de ouro escrito embaixo dela
  • Exemplo: Uma carta "Moeda de Ouro" gera 1 de ouro
  • Uma carta "Cofre Real" gera 5 de ouro
  • Você vê o total no topo da tela: "Ouro Total: 15"
```

**O que você vê:**
- 🟡 Valor de ouro total no topo
- 📊 Lista de cartas e quanto cada uma gera
- ✓ Botão "Confirmar" para passar para a próxima fase

**Dica:** Quanto mais cartas no seu campo, mais ouro você ganha!

---

#### **FASE 2: ESCOLHA 🎲**

Aqui você pode **lançar dados** para ganhar bônus especiais:

```
Opções disponíveis:
  • Lançar 2 dados padrão (1-6 cada)
  • Cada dado pode virar um cristal mágico
  • Cristais são moeda alternativa para comprar cartas raras
```

**Como funciona:**
1. Clique em **"Lançar Dados"** 
2. Veja quanto saiu em cada dado
3. Escolha quais dados viram cristais:
   - Clique no dado que quer converter
   - Clique em **"Cristalizar"**
4. Seu ouro total agora inclui cristais

**Exemplo:**
```
Você tem: 10 de ouro + 0 cristais
Lança os dados: saem 4 e 3
Escolhe cristalizar o 4: Agora tem 10 ouro + 4 cristais
```

**Dica:** Nem sempre vale a pena lançar dados! Às vezes você tem ouro suficiente.

---

#### **FASE 3: POSICIONAMENTO 🛡️**

Aqui você coloca suas cartas **no campo** (máximo 6 cartas):

```
O que é o Campo?
  • Onde suas cartas "vivem" durante a batalha
  • Limite: 6 cartas por vez
  • Cartas no campo geram ouro e lutam por você
```

**Como funciona:**
1. Veja suas **cartas na mão** (parte inferior)
2. Clique em uma carta que quer colocar no campo
3. A carta aparece no campo (vazio no topo)
4. Repita até ter as cartas que quer lutar

**Explicação de tipos de cartas:**

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Guerreiro** ⚔️ | Ataca inimigos | Soldado (1 ataque), Cavaleiro (3 ataques) |
| **Produtor** 💰 | Gera ouro | Mineiro (2 ouro), Mercador (4 ouro) |
| **Mágico** ✨ | Habilidades especiais | Feiticeiro, Curador |
| **Defensor** 🛡️ | Reduz dano recebido | Paladino, Muralha |

**Limite de Campo:**
- Você PODE colocar no máximo 6 cartas
- Se tiver 6 e quer mais, remove uma clicando nela novamente
- Quanto maior seu campo, mais forte é seu exército!

**Dica:** Pense estrategicamente! Quer mais ataque ou mais defesa?

---

#### **FASE 4: COMBATE ⚡**

Aqui a MAGIA acontece! Suas cartas **lutam automaticamente** contra seus oponentes:

```
O que acontece:
  1. Todas as cartas ativas começam uma luta simultânea
  2. Cartas com ataque = ⚔️ causam dano
  3. Cartas com defesa = 🛡️ absorvem dano
  4. Dano total = Ataque total - Defesa total
```

**Sistema de Combate:**

```
Exemplo:
  SEU CAMPO:
    • Guerreiro (2 ataque)
    • Cavaleiro (3 ataque)
    • Paladino (1 ataque, 2 defesa)
  
  Seu ataque total: 2 + 3 + 1 = 6
  Sua defesa total: 2
  
  CAMPO DO INIMIGO:
    • Soldado (1 ataque)
    • Muralha (0 ataque, 3 defesa)
  
  Ataque do inimigo: 1
  Defesa do inimigo: 3
  
  RESULTADO:
    • Você causa 6 dano, ele tem 3 de defesa = 3 de dano nele
    • Ele causa 1 dano, você tem 2 de defesa = 0 de dano em você!
    • Você vence este turno!
```

**Vida dos Jogadores:**
- Todo jogador começa com **20 de vida**
- Cada turno você recebe dano igual a: (Ataque inimigo - Sua Defesa)
- Se sua vida chegar a 0, você é eliminado
- Último jogador vivo vence! 👑

**Dica:** Equilíbrio é importante! Não invista TUDO em ataque.

---

### 💰 Compra de Cartas

Após as 4 fases (ou entre elas), você pode **comprar novas cartas** com seu ouro:

**Como Comprar:**
1. Veja a área de "Loja" ou "Cartas Disponíveis"
2. Cada carta mostra:
   - Nome
   - Imagem
   - Custo em ouro (canto inferior)
   - Habilidades
3. Clique em uma carta que pode pagar
4. Carte é adicionada à sua mão
5. Seu ouro diminui

**Dica Importante:**
- Não gaste todo seu ouro de uma vez
- Algumas cartas caras são MUITO poderosas
- Planeje suas compras com antecedência

**Exemplo de Estratégia:**
```
Você tem 15 de ouro
Opção 1: Comprar 3 cartas baratas (5 de ouro cada)
Opção 2: Comprar 1 carta cara e poderosa (12 de ouro)
Qual é melhor? Depende da situação!
```

---

### ⭐ Evolução de Cartas

Algumas cartas podem **evoluir** e se tornar mais poderosas:

```
Como funciona:
  • Você precisa ter 2 cartas iguais no seu campo
  • Às vezes há um botão "Evoluir"
  • A carta se transforma em uma versão melhorada
  • Exemplo: Soldado (1 ataque) → Veterano (3 ataque)
```

**Benefícios da Evolução:**
- ⬆️ Ataque aumenta
- 💰 Ouro gerado aumenta
- ✨ Ganha novas habilidades

**Dica:** Evolução é MUITO forte! Procure coletar pares de cartas.

---

### 🎯 Campo (Limite 6)

Seu **campo** é o espaço onde suas cartas lutam:

```
Visualização:
┌─────────────────────────────────┐
│   🛡️ PALADINO    🧙 FEITICEIRO  │
│   ⚔️ GUERREIRO   💰 MINEIRO     │
│   ⚔️ CAVALEIRO   🛡️ MURALHA     │
└─────────────────────────────────┘
      SEU CAMPO (6/6 CARTAS)
```

**Regras:**
- Máximo 6 cartas simultaneamente
- Todas as cartas no campo lutam
- Todas as cartas geram ouro

**Estratégia:**
- 2-3 cartas: Seguro, menos complexidade
- 4-5 cartas: Estratégia normal
- 6 cartas: Agressivo, máximo poder

---

### 🎲 Combate Automático

O combate é **100% automático**:

```
Você NÃO escolhe:
  ✗ Qual carta ataca primeiro
  ✗ Qual inimigo atacar
  ✗ Padrão de luta

O que acontece automaticamente:
  ✓ Suas cartas aplicam TODA seu ataque
  ✓ Cartas inimigas aplicam TODA defesa
  ✓ Dano é calculado automaticamente
  ✓ Resultado é mostrado
```

**Isso significa:**
- Só importa o TOTAL de ataque e defesa
- Ordem das cartas não importa
- Sem cliques complexos durante combate

**Vantagem:** Simples e rápido! Depois você aprende estratégias avançadas.

---

### 🌟 Sinergias (Combinações Especiais)

Algumas cartas funcionam **melhor juntas**:

```
Exemplo de Sinergia:
  • Você tem: 2 "Guerreiros Elfo"
  • Sinergia: Guerreiros Elfo ganham +2 ataque cada um
  • Resultado: 1 ataque (normal) + 2 (sinergia) = 3 por guerreiro
```

**Como Encontrar Sinergias:**

Procure por símbolos ou cores iguais:
- 🌳 Cartas com símbolo Floresta = Bônus Floresta
- ⚡ Cartas com símbolo Tempestade = Bônus Tempestade
- 🔥 Cartas com símbolo Fogo = Bônus Fogo

**Tipos de Sinergias Comuns:**

| Tipo | Bônus | Exemplo |
|------|-------|---------|
| **Raça** | +1 ao atributo | 2 Elfos = +2 ataque |
| **Classe** | Habilidade nova | 2 Magos = Magia extra |
| **Elemento** | Atributo especial | 2 Fogo = Dano crítico |

**Dica Importante:**
Sinergias são MUITO poderosas! Um bom jogador coleta cartas que combinam bem.

---

## 5️⃣ CONTROLES

### Controles Principais

| Ação | Como Fazer |
|------|-----------|
| **Mover carta para o campo** | Clique na carta → Clique no espaço vazio |
| **Remover carta do campo** | Clique na carta no campo |
| **Ver detalhes de carta** | Passe o mouse sobre a carta (tooltip aparece) |
| **Comprar carta** | Clique na carta na loja |
| **Passar de fase** | Clique no botão "Próxima Fase" ou "Confirmar" |
| **Lançar dados** | Clique no botão "Lançar Dados" |
| **Cristalizar dados** | Clique no dado → Confirmar |
| **Ver histórico** | Clique em "Histórico" (canto superior) |

### Interface Explicada

```
┌──────────────────────────────────────┐
│ ♥ 20 VIDA    TURNO: 3    ⭐ 15 OURO  │ ← Informações principais
├──────────────────────────────────────┤
│   SEU CAMPO (cartas em combate)       │
│  [Carta1] [Carta2] [Carta3]           │
│  [Carta4] [Carta5] [Vazio]            │
├──────────────────────────────────────┤
│ OPPONENT'S INFO:                      │
│ • João - 18 vida                      │
│ • 6 cartas no campo                   │
│ • Próximo turno dele em 30s           │
├──────────────────────────────────────┤
│            SUAS CARTAS NA MÃO         │
│  [Moeda] [Guerreiro] [Mago] [+3]     │
└──────────────────────────────────────┘
```

### Dicas de Navegação

- 🖱️ **Mouse**: Use para clicar em tudo
- ⌨️ **Teclado**: Algumas ações têm atalhos
- 📱 **Mobile**: Versão responsiva funciona em celulares
- ♿ **Acessibilidade**: Interface é amigável para leitores de tela

---

## 6️⃣ DICAS DE ESTRATÉGIA

### Estratégias Básicas para Ganhar

#### 🎯 Dica 1: Econômia Forte
```
O que fazer:
  • Compre cartas que geram ouro (Mineiros, Comerciantes)
  • No início, investir em economia é mais importante que ataque
  • Com mais ouro, você pode comprar cartas melhores depois
  
Exemplo ruim:
  Turno 1: Você compra um Guerreiro de 8 ouro
  (Ótimo! Mas agora você mal tem ouro para comprar mais)

Exemplo bom:
  Turno 1: Você compra um Mineiro de 3 ouro (gera 2 ouro/turno)
  Turno 2: Agora você tem mais ouro para opções melhores
```

#### ⚔️ Dica 2: Equilíbrio Ataque-Defesa
```
Distribua seu poder assim:
  • 40% em geração de ouro (Economia)
  • 35% em ataque (Dano)
  • 25% em defesa (Proteção)

Se você tiver só ataque:
  ✗ Você causa 20 dano mas recebe 15 = morre em 2 turnos

Se você tiver ataque + defesa:
  ✓ Você causa 12 dano e recebe 3 = sobrevive muito mais tempo
```

#### 🔄 Dica 3: Procure por Sinergias
```
Melhor estratégia:
  • Escolha um tipo de carta (Ex: Elfos)
  • Colecione MUITAS dessa raça
  • As sinergias ficam incrivelmente poderosas
  
Exemplo:
  Turno 1-3: Você coleta 5 cartas Elfo
  Turno 4: Com todas as sinergias ativas = você é imbatível!
```

#### 💪 Dica 4: Não Desperdice Ouro
```
Bom gerenciamento:
  Turno 1: 10 de ouro → Compra uma carta de 10 = 0 restante (OK)
  Turno 2: 5 de ouro → Não compra nada, guarda para próximo

Péssimo gerenciamento:
  Turno 1: 10 de ouro → Compra uma carta de 3, outra de 2, outra de 2
  Resultado: Gastou 7, mas poderia ter comprado algo de 10!
```

#### 🎯 Dica 5: Adaptação em Tempo Real
```
Se você está perdendo:
  • Invista mais em defesa
  • Procure comprar cartas que reduzem dano
  • Considere sacrificar ataque por sobrevivência

Se você está ganhando:
  • Aproveite para comprar cartas mais caras
  • Invista em sinergia
  • Continue o momentum!
```

#### 🏆 Dica 6: Observe seus Oponentes
```
Estratégia inteligente:
  • Veja quantas cartas eles têm
  • Veja se há padrão (só ataque? só defesa?)
  • Adapte sua estratégia para explorar fraquezas deles
  
Exemplo:
  João tem 6 ataque, 0 defesa
  → Você investe em defesa para sobreviver
  → Você ganha do desgaste
```

### Estratégias Avançadas

#### 🌟 A Estratégia "Snowball"
```
Ideia: Crescimento exponencial

Turno 1: Compre 1 Mineiro (3 ouro)
Turno 2: Tem 1 Mineiro + início loja = compra 2 Mineiros
Turno 3: Tem 3 Mineiros = compra 1 Guerreiro + mais Mineiros
Turno 4+: Você é forte demais!

Este é o estilo mais eficaz para iniciantes!
```

#### ⚡ A Estratégia "Rush"
```
Ideia: Ataque imediato

Turno 1: Compre 2 Guerreiros
Turno 2: Tenha 4 de ataque, derrote inimigos antes deles crescerem
Turno 3: Você é o último de pé!

Risco: Se falhar nos turnos 2-3, você não tem economia e perde
```

#### 🛡️ A Estratégia "Turtle" (Tartaruga)
```
Ideia: Sobrevivência absoluta

Turno 1: Compre Defensores
Turno 2: Tenha tanques
Turno 3+: Enquanto outros morrem batendo em você, você cresce
Turno 6+: Você esmaga todos

Risco: Lento, outros podem explorar seu ataque baixo
```

### Erros Comuns para EVITAR

| ❌ Erro | ✅ O que fazer |
|--------|--------------|
| Gastar TUDO seu ouro | Sempre reserve para próximo turno |
| Ignorar defesa | 40% do seu poder deve ser defesa |
| Mudar estratégia todo turno | Escolha 1 caminho e siga |
| Comprar cartas aleatórias | Procure sinergias! |
| Não olhar seus oponentes | Adapte sua estratégia |
| Colocar 6 cartas fracas | 4 cartas fortes > 6 fracas |

---

## 7️⃣ TROUBLESHOOTING (Problemas Comuns)

### Problema: "Página não carrega (branca/em branco)"

**Soluções:**
1. Aguarde 30 segundos (primeira carga é lenta)
2. Pressione `Ctrl+Shift+R` (limpar cache)
3. Abra outro navegador
4. Verifique se o terminal mostra `✓ Frontend pronto`

```bash
# Se nada funcionar, reinicie:
npm run stop    # ou Ctrl+C
npm run start
```

---

### Problema: "Erro de conexão com servidor"

**Significa:** O backend não está rodando

**Solução:**
```bash
# Em um novo terminal, na pasta do projeto:
npm run server

# Se dá erro, verifique se a porta 5000 está livre:
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

---

### Problema: "Docker não inicia"

**Significado:** Banco de dados não está rodando

**Soluções:**

Windows/Mac:
1. Abra o aplicativo "Docker Desktop"
2. Aguarde até aparecer "Docker is running" (círculo verde)
3. Tente novamente

Linux:
```bash
# Inicie o Docker
sudo systemctl start docker

# Se não tem permissão:
sudo usermod -aG docker $USER
# Faça logout e login novamente
```

---

### Problema: "Porta 3000 já está em uso"

**Significa:** Outro aplicativo está usando aquela porta

**Solução:**

Opção 1 - Feche o outro aplicativo
```bash
# Veja qual processo está usando a porta
Windows: netstat -ano | findstr :3000
Mac/Linux: lsof -i :3000

# Feche esse aplicativo normalmente
```

Opção 2 - Use outra porta
```bash
# Inicie em porta diferente:
PORT=3001 npm run client
# Depois abra: http://localhost:3001
```

---

### Problema: "npm install falha"

**Solução 1:** Limpar cache
```bash
npm cache clean --force
npm install
```

**Solução 2:** Deletar node_modules
```bash
rm -rf node_modules package-lock.json
npm install
```

**Solução 3:** Usar yarn em vez de npm
```bash
npm install -g yarn
yarn install
yarn start
```

---

### Problema: "Jogo fica lento/lagado"

**Soluções:**
1. Feche outras abas do navegador
2. Limpe cache: `Ctrl+Shift+Delete` → "Todos os tempos"
3. Use um navegador mais leve (Chrome > Firefox > Safari)
4. Desligue extensões do navegador
5. Reinicie o Docker: `docker restart`

---

### Problema: "Não consigo conectar com outro jogador"

**Causa provável:** Firewall ou rede

**Soluções:**
1. Certifique que AMBOS estão na mesma rede
2. Peça para o firewall permitir porta 5000 e 3000
3. Se estão em PCs diferentes, use o IP do host:
   ```bash
   # No PC principal, descubra o IP:
   # Windows: ipconfig
   # Mac/Linux: ifconfig
   
   # Outros acessam: http://SEU_IP:3000
   ```

---

### Problema: "Cartas não aparecem corretamente"

**Solução:**
```bash
# Limpe o cache do navegador:
# Chrome: Ctrl+Shift+Delete → Todas as cookies e dados do site

# Ou simplesmente reinicie tudo:
npm run stop
npm run start
```

---

### Problema: "Perdi meu progresso"

**Infelizmente:**
- Dados são salvos em tempo real
- Se você fechou o jogo, não há "voltar atrás"
- Próxima partida começará zerado (isso é proposital!)

---

### Nada disso funcionou?

```bash
# Morte e reencarnação (reset total)
npm run stop
rm -rf node_modules
npm install
docker-compose down
docker-compose up -d
npm run start
```

Se AINDA não funcionar, seu ambiente pode ter conflito. Procure ajuda fornecendo:
- Sistema operacional (Windows/Mac/Linux)
- Versão Node.js (`node --version`)
- Mensagem de erro EXATA (copie e cole)

---

## 8️⃣ ESTRUTURA DO PROJETO

### 📁 Organização de Pastas

```
dominion_arena_tatica/
├── 📂 frontend/                 # Aplicação do navegador
│   ├── 📂 src/
│   │   ├── components/         # Componentes visuais (Menu, Campo, Combate)
│   │   ├── pages/              # Páginas (Lobby, Jogo, Resultados)
│   │   ├── styles/             # CSS e temas
│   │   └── App.js              # Arquivo principal
│   ├── package.json
│   └── public/                 # Imagens, ícones
│
├── 📂 backend/                  # Servidor (Node.js)
│   ├── 📂 src/
│   │   ├── api/                # Endpoints (create-room, join-room, etc)
│   │   ├── models/             # Lógica do jogo (combate, economia)
│   │   ├── sockets/            # Comunicação tempo real
│   │   └── server.js           # Arquivo principal
│   ├── package.json
│   └── 📂 database/            # Scripts SQL
│
├── 📂 database/                 # Configuração Docker
│   ├── docker-compose.yml      # Banco de dados
│   └── init.sql                # Dados iniciais
│
├── 📄 start.sh                  # Script de inicialização
├── 📄 stop.sh                   # Script para parar
├── 📄 package.json              # Configurações gerais
└── 📄 README.md                 # Este arquivo


Analogia simplificada:
  • frontend = Que você VỆEFICIENTES E
  • backend = Cérebro que pensa e decide
  • database = Memória que guarda informações
```

### 📄 Arquivos Importantes

| Arquivo | O que faz | Você precisa mexer? |
|---------|-----------|-------------------|
| `start.sh` | Inicia tudo | ❌ Não |
| `frontend/src/App.js` | Define menu principal | ✅ Se quiser customizar |
| `backend/src/server.js` | Controla lógica do jogo | ✅ Se quiser adicionar regras |
| `database/init.sql` | Define cartas disponíveis | ✅ Se quiser criar novas cartas |
| `package.json` | Lista de dependências | ❌ Apenas se adicionar pacotes |

### 🔄 Como Funciona a Comunicação

```
1. Você clica em "Criar Sala" (Frontend)
   ↓
2. Navegador envia: POST /api/create-room
   ↓
3. Servidor (Backend) processa e salva no banco
   ↓
4. Banco de dados (Database) guarda informação
   ↓
5. Servidor envia resposta: { "roomId": "abc123" }
   ↓
6. Seu navegador recebe e mostra a sala
   ↓
7. Quando outro jogador entra: Servidor avisa seu navegador em tempo real (WebSocket)
```

### ⚙️ Tecnologias Usadas

**Você não precisa saber detalhes, mas é legal conhecer:**

- **React**: Biblioteca para criar interfaces (O que você vê)
- **Node.js + Express**: Servidor que controla o jogo
- **PostgreSQL**: Banco de dados que guarda tudo
- **Socket.io**: Comunicação tempo real entre jogadores
- **Docker**: Containerização (roda o banco de dados isolado)

**Analogia:**
```
React = Artista que desenha a interface
Express = Árbitro que segue as regras
PostgreSQL = Caderno que anota tudo
Socket.io = Telefone para conversar com outros jogadores
Docker = Cápsula de vidro que protege o banco
```

---

## 🎓 Próximos Passos

Parabéns! Agora você sabe como jogar Dominion Arena Tática! 🎉

### Para Melhorar Ainda Mais:

1. **Jogue várias partidas** contra IA em dificuldade Fácil
2. **Experimente diferentes estratégias** (Snowball, Rush, Turtle)
3. **Observe outros jogadores** e copie suas táticas
4. **Leia os detalhes das cartas** com atenção
5. **Jogue contra amigos** quando estiver confiante

### Recursos Adicionais:

- 📖 **Guia de Cartas**: Veja todos os tipos de cartas no jogo
- 🏆 **Rankings**: Veja quem está ganhando
- 💬 **Chat**: Fale com outros jogadores
- ⚙️ **Configurações**: Customize sua experiência

---

## ❓ FAQ (Perguntas Frequentes)

**P: Posso jogar offline?**
R: Não, o jogo precisa de internet para conectar ao servidor.

**P: Posso jogar contra a IA?**
R: Sim! Na maioria dos modos, você pode jogar contra adversários controlados por IA.

**P: Meu progresso é salvo?**
R: Cada partida é independente. Você não tem "conta persistente", cada jogo é novo.

**P: Quantas cartas tem no jogo?**
R: No mínimo 50+ cartas diferentes com múltiplas sinergias.

**P: Posso criar minha própria carta?**
R: Sim! Veja a pasta `database/init.sql` e adicione uma nova linha.

**P: O jogo é pago?**
R: Não! Dominion Arena Tática é totalmente grátis e de código aberto.

**P: Posso jogar em celular?**
R: Sim! A interface é responsiva, mas mouse é melhor que toque.

---

## 📞 Suporte e Comunidade

Se tiver dúvidas:
- 🐛 Abra uma "Issue" no GitHub
- 💬 Participe do Discord da comunidade
- 📧 Envie um email para support@dominion-arena.dev

---

**Divirta-se! Que o melhor jogador vença! 🎮👑**

---

*Última atualização: 2024*
*Versão do Guia: 1.0*
