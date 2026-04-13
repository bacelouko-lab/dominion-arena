# Plano de Padronização Visual Premium: Dominion Arena

O objetivo deste plano é elevar a qualidade visual das cartas para o nível "Premium" demonstrado no mockup, resolvendo a inconsistência das imagens e a falta de padrão no layout.

## ⚠️ Mudança de Rota
O usuário expressou insatisfação com a variabilidade das artes e a discrepância entre o mockup (bonito) e a implementação atual (básica). Iremos reconstruir o sistema visual para ser fiel ao mockup.

## 🛠️ Mudanças Propostas

### 1. Sistema de Moldura Evolutiva (CSS Premium)
Criar um sistema de camadas visuais que combine o material da moldura (Custo) com o brilho da aura (Região).

- **Materiais de Moldura por Custo:**
  - **Custo 2 (Bronze):** Moldura em tons de cobre/bronze envelhecido, metálica básica.
  - **Custo 3 (Prata):** Moldura em prata polida, brilho metálico frio.
  - **Custo 5 (Ouro):** Moldura dourada brilhante com ornamentos (estilo mockup).
  - **Custo 8 (Diamante):** Moldura de cristal translúcido com brilho interno, refração e aura divina.
- **Tintas de Região (Aura/Glow):**
  - **Solari:** Brilho âmbar/dourado.
  - **Gladius:** Brilho carmesim.
  - **Aether:** Brilho ciano místico.
  - **Veridian:** Brilho esmeralda.
  - **Umbra:** Brilho violeta sombrio.
- **Tipografia:** Integração da fonte **Cinzel** (Google Fonts) para títulos e classes.

### 2. Refatoração do Componente [Card.js](file:///c:/Users/Rubens%20Bacelar/Desktop/dominion%20arena%20tatica%20-%20v1/frontend/src/components/Card.js)
- Implementar SVGs inline para os ícones de **POW (Espada/Escudo)** e **GRD (Escudo de Placas)** nos cantos.
- Criar um componente de "Material da Moldura" que injete as classes CSS corretas baseadas no `card.custo`.
- Garantir que a **Dádiva** seja o elemento central de leitura embaixo da arte.

### 3. Estratégia de Arte Unificada
Todas as 25 artes serão regeradas (assim que a cota permitir) seguindo um **Template Único de Prompt**:
> *“Epic fantasy portrait of [CHARACTER NAME], [REGION] themed, professional digital painting, cinematic lighting, dark background, centered composition, high detail, 4k.”*
- Isso garante que todas as imagens tenham o mesmo estilo, tamanho de rosto e iluminação, eliminando a sensação de "falta de padrão".

## Questions
1. **Fontes:** Posso utilizar a fonte Google 'Cinzel' para os nomes das cartas? Ela dá o toque épico que vimos no mockup.
2. **Dimensões:** Para caber no board atual, o tamanho ideal é 130x190px. Alguma objeção?

## Verification Plan
### Automated Tests
- Verificar via browser se todas as 25 cartas renderizam a moldura idêntica via CSS.
### Manual Verification
- Comparar a implementação final lado a lado com o mockup para garantir fidelidade de 100%.
