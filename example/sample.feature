# language: pt
Funcionalidade: Inputar dados da seção características
Eu como usuário
Quero inputar os dados da seção características
Para dar andamento no cadastramento de um novo produto

Contexto:
  Dado que eu esteja na tela de cadastro de produtos
  E a seção de características estiver habilitado

@registerNewProductSectionCharacteristics
Cenário: Validar preenchimento das características
  Quando preencher as características do produto
  E selecionar alguma categoria
  Então devo visualizar o campo de foto do produto