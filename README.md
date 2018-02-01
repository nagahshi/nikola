# NIKOLA
> Nikola é uma base para Restful API feita em Nodejs, implementação simples do ActiveRecord para trabalhar com seu banco de dados mysql e autenticação com JWT.

### Instalação
Para usar o Nikola como sua API, execute:
```
git clone
```
### Configuração
Após a cópia e instalação de dependências crie o arquivo de variáveis ammbiente e configure com seus dados

##### Exemplo .env
```
API_PORT=1234 #porta de acesso a api

JWT_SECRET=secreta #defina a chave secreta para a autenticação JWT

MYSQL_HOST=localhost #host de seu banco de dados
MYSQL_USER=root #usuario de acesso ao seu banco de dados
MYSQL_PASSWORD=root #sua senha para acesso ao banco de dados
MYSQL_DATABASE=database #nome de seu banco de dados

RESTIFY_NON_BLOCK=['/auth/login','/auth/register'] #Rotas que não serão bloqueadas pelo middleware de JWT

MAILER_HOST=localhost #Host do servidor de email
MAILER_PORT=25 #Porta do servidor
MAILER_USER=user@user.com #Usuário ou email
MAILER_PASSWORD=secret #Senha do usuário
```
>Nota: Ainda não possuímos um sistema de migração de dados portanto seu banco de dados deve estar pronto.

### Rotas
Para criar rotas utilizamos o pacote [Restify](http://restify.com/) e um pacote suporte para organizar as rotas o [restify-router](https://www.npmjs.com/package/restify-router), portanto podemos criar nossas rotas com mesmo padrão do restify usando o restify-router e exportá-las para serem aplicadas em qualquer ponto da aplicação, mantendo o modelo de domínios.

##### Exemplo api/domains/category/index.js
```
const Router     = require('restify-router').Router
const router     = new Router()

router.get('/category', (req,res,next) => {
    res.send('minha primeira rota de categoria')
    next()
})
module.exports = router;
```

##### Exemplo registro de sua rota api/index.js
```
// require restify to manipulate routes
const server = require('./config/server')

/**
 *  FOR REGISTER ROUTER
 *  APPLY SERVER TO REGISTER ROUTES
 */
require('./domains/category').applyRoutes(server) // aqui voce importa suas rotas e aplica em seu servidor :D

//listener server at port
server.listen(process.env.API_PORT)
```
> E “Voila!“ sua rota já está funcionando

### Modelos
Um modelo serve para especificar como o Nikola irá se comportar mediante as ações no banco de dados, para criar um modelo deve se estender a class Repository que herdará opções de manipulação do banco de dados.
Na construção da classe pai defina o nome da tabela no banco de dados, nome de apresentação(para tratamento de erros) e por fim seus campos com suas validações.

#### Validações
É um objeto com os nomes dos campos que podem ser validados e usados no banco de dados tipos:

* "required: 1" - defina essa propriedade para exigir seu envio para que possa ser salvo os dados no banco de dados
* "min: 6" - defina um tamanho mínimo para ser salvo
* "max: 100" - defina um tamanho máximo para ser salvo

##### Exemplo api/domains/category/model
```
const Repository = require('../../config/repository')

class Model extends Repository {
  constructor(){
    let validates = {
      id:'',
      name: {required: 1, min: 6, max:10},
      user_id: {required: 1}
    }
    super('categories', 'Categorias', validates)
  }
}

module.exports = Model
```
#### Uso de modelos
Após instanciado o modelo adota métodos da classe Repository e tem acesso aos seguintes métodos:

* where(campo,operador,valor) - definição do método WHERE em sql com operador AND
* whereOr(campo,operador,valor) - definição do método WHERE em sql com operador OR
* whereRaw(query) - WHERE com consulta por query crua
* join(table,estrangeira,local) - Operação JOIN em sql
* select(campos) - Campos pré definidos em query crua a serem selecionados
* get(pagina) - após o preparo da consulta utilize esse método para retornar os dados paginados
* first() - após o preparo da consulta utilize esse método para retornar o primeiro registro encontrado
* toSql() - retorna a consulta em SQL que será executada
* update(campos) - recebe um array com os campos a serem alterados e executa essa ação em SQL
* delete() - executa DELETE após o preparo da consulta
* store(campos) - recebe um array com os objetos, os dados são salvos com método INSERT
* query(query) - consulta completa por query crua
>Nota aqui sempre  retornado uma Promise!

### Controladores
Controladores servem para prover ações/validações/tratamentos para persistência no banco de dados via rotas da API. fornece um controle padrão que pode ser estendida de controller que se encontra em api/config/controller.js. Em sua construção defina o modelo a ser utilizado pela classe pai(Controller) que lhe estenderá alguns métodos para uso básico e claro que podem ser sobrescritos.

#### Métodos criados ao estender Controller
Alguns métodos são exportados a classe filha

##### index(req)
"req" é a instância de requisição do própio restify, aqui podemos recuperar os parametros que nos fora passado.
O método index por padrão nos retorna uma consulta paginada de todos os registros onde aqui monitoramos o parametro via query "page"

#### store(req)
Valida e salva os dados recebidos via requisição

#### show(req)
Retorna apenas um registro via requisição usando o parâmetro "id" como consulta

#### update(req)
Altera os dados recebidos via requisição usando o parâmetro "id" como consulta

#### destroy(req)
Deleta os dados usando o parâmetro "id"

##### Exemplo de uso da classe api/config/controller.js
```
const Model = require('./model')
const skelController = require('../../config/Controller')

class Controller extends skelController{
  constructor (){
    super(Model)
  }
}

module.exports = Controller
```
### Autenticação ou JWT
Utilizamos a biblioteca jsonwebtoken para geração de token com o modelo JWT.
Para criar um token de autenticação use a biblioteca auth em api/config/auth.js, que criará um token padrão
```
// após importá-la use auth e passe seu objeto para criação de seu token
auth({email, telefone, id})
```
### Mailer 
Utilizamos a biblioteca nodemailer para envio de emails.
Para enviar um email use a biblioteca Mailer em api/config/Mailer.js
```
// após importá-la, instancie e use o método send com alguns parametros
send (from, to, subject, html, text)
```
#### Envio com HTML personalizado
Para elaborar um email com html personalizado é possivel ainda utilizar a biblioteca [handlebarsjs](http://handlebarsjs.com/)
veja o modelo de envio com html personalizado.
```
let template = hb.compile(fs.readFileSync(`${__dirname}/templates/register.tpl`, 'utf8'))
let data = {token: `${url}/${token}`}
let mailer = new Mailer()

mailer.send('<teste> teste@teste', email, 'Bem vindo', template(data), '')
```
