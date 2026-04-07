# Mecanicas do Dominion Arena Tatica

## Sistema de Turnos

### Fases
1. **Roll**: Rolar dados para gerar ouro
2. **Buy**: Comprar cartas da loja
3. **Combat**: Atacar adversarios
4. **End**: Fim do turno, descartar/preparar para proximo

## Sistema de Ouro

- Cada dado rola 1-6
- Minimo 1 dado, maximo 3 dados
- Ouro reinicia a cada turno
- Usado para comprar cartas

## Cartas

### Custos
- Variam de 2 a 8 de ouro
- Cartas mais caras = mais poderosas

### Atributos
- **ATK**: Dano causado em combate
- **DEF**: Defesa reduz dano recebido
- **Habilidade**: Efeito especial

## Evolucao

- 2 cartas identicas = 1 carta evoluida
- Carta evoluida: +30% ATK, +30% DEF
- Nao tira da mao, ativa automaticamente
- Pode evoluir novamente se conseguir mais 2

## Combate

### Calculo
```
Dano = ATK atacante - DEF defensor
Se Dano < 0: Dano = 0
Vida defensor -= Dano
```

### Automatico
- Baseado em ATK/DEF das cartas no campo
- Sem ordem ou mecanica especial
- Ambos os lados sofrem dano

## Sinergias

### Por Regiao
- Cada regiao oferece bonus
- Quanto mais cartas da mesma regiao, mais forte

### Por Classe
- Guerreiros: +ATK
- Magos: +DEF ou efeitos magicos
- Ladinos: +velocidade
- Suporte: +cura ou escudos
- Mercadores: +ouro
- Monstros: variam
- Dragoes: extremamente poderosos

## Limites

- Vida maxima: nao existe (comeca 20, pode aumentar)
- Vida minima: 0 (elimina jogador)
- Cartas na mao: 5
- Cartas no campo: 6
- Dados: 3

## Victoria

- Ultimo jogador com vida > 0 vence
- Pode haver tempo limite de rondas
