# Personal expenses control

Este repositório contém a implementação do backend para o aplicativo de controle de despesas pessoais, com objetivo de ajudar pessoas que têm dificuldade em controlar suas finanças.

## Funcionalidades

Suas principais funcionalidades são voltadas à(ao):

- Gerenciamento de Usuários: cadastro, autenticação e gerenciamento de perfis de usuários;
- Registro de Transações: adição, edição e exclusão de despesas e receitas;
- Categorias Personalizadas: criação e gerenciamento de categorias para classificar transações; e
- Relatórios Financeiros: geração de relatórios e resumos financeiros para análise de despesas e receitas.

## Stack utilizada

- **Node.js**: Plataforma de desenvolvimento do servidor.
- **Express.js**: Framework para construção de APIs RESTful.
- **PostgreSQL**: Banco de dados relacional para armazenamento das informações.
- **JWT (JSON Web Tokens)**: Implementação de autenticação segura.

## Rodando localmente

Clone o projeto

```bash
  git clone https://github.com/enyllaoliveira/personal-expense-control-back.git
```

Entre no diretório do projeto

```bash
  cd personal-expense-control
```

Instale as dependências

```bash
  npm install
```

Inicie o servidor

```bash
  npm start
```

## Aprendizados

Gosto da área financeira e isso com certeza ajudou a tornar este projeto um desafio empolgante. Ser/dar suporte aos usuários que não sabem para aonde vão seus recursos financeiros é gratificante. 
Todavia, ele foi cheio de aprendizados e desafios técnicos, especialmente em segurança e persistência de dados. A implementação de autenticação com JWT trouxe maior segurança para garantir que apenas usuários autenticados pudessem acessar dados sensíveis. Esse processo envolveu desafios como configuração de rotas protegidas e manipulação de tokens.

No trabalho com banco de dados PostgreSQL, houve maior compreensão em relação à modelagem relacional e à criação de consultas eficientes para manipulação dos dados de usuários, transações de receitas, despesas e suas respectivas categorias. 

Por fim, a integração entre frontend e backend e seus desafios práticos.

## Roadmap

- criação das rotas de usuário - ok
- conectar ao banco de dados - back
- conectar front ao back - ok
- formatar para real - ok
- trabalhar com regex para trabalhar com vírgula (valor financeiro) - ok
- criar rotas para adicionar, editar, listar e deletar valores de cartão de crédito - ok
- criar rotas para adicionar, listar, editar e deletar despesas e receitas - ok
- Filtros e visualizações: Criar filtros para que o usuário visualize despesas e receitas por categoria, período, etc - ok
- Segurança JWT: Garantir que todas as rotas protegidas do backend exijam autenticação usando JWT - ok

**backlog**:
- Deploy: Preparar o frontend e o backend para deploy (ex: frontend no Vercel/Netlify e backend no Heroku ou servidor VPS).
- Testes: Realizar testes manuais ou automatizados para garantir que todas as rotas, tanto do frontend quanto do backend, estejam funcionando corretamente.
- melhorar e inserir mais filtragem
- criar rotas de expectativas/realidade de orçamento com alerta de limite ultrapassado
