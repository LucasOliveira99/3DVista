# ObraVista 3D

Este projeto é uma experiência web para visualizar e explorar um projeto de engenharia em 3D. A ideia é que uma pessoa escaneie um QR Code instalado em uma obra e consiga conhecer, pelo celular ou computador, como o espaço ficará depois de concluído.

Criei este projeto pensando em uma entrevista de emprego. Meu objetivo foi demonstrar, em uma aplicação prática, como eu usaria React, Three.js e WebGL para transformar um modelo de engenharia em uma experiência interativa e acessível pelo navegador.

## O que eu desenvolvi

- Visualização 3D de um modelo no formato `.glb`.
- Modo de visualização 360° para girar e aproximar o modelo.
- Modo de passeio para olhar ao redor e caminhar pelo projeto clicando ou tocando no chão.
- Ajuste automático da câmera de acordo com o tamanho real do modelo carregado.
- Detecção da geometria real do modelo para manter a câmera na altura do piso durante o passeio.
- Interface responsiva para uso em computadores e dispositivos móveis.
- Configuração de build compatível com publicação no GitHub Pages.

## Tecnologias

- React
- Vite
- Three.js
- React Three Fiber
- React Three Drei
- WebGL

## Como rodar localmente

### Pré-requisitos

Eu recomendo usar uma versão recente do Node.js e do npm.

Para conferir as versões instaladas:

```bash
node --version
npm --version
```

### Instalação

Depois de clonar ou baixar o projeto, instale as dependências com:

```bash
npm install
```

### Servidor de desenvolvimento

Para iniciar o projeto localmente:

```bash
npm run dev
```

O Vite exibirá uma URL parecida com:

```text
http://localhost:5173
```

Para testar em um celular conectado à mesma rede Wi-Fi, inicie o servidor expondo o endereço da rede local:

```bash
npm run dev -- --host
```

### Build de produção

Para gerar a versão pronta para publicação:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

Para testar localmente exatamente essa versão de produção:

```bash
npm run preview
```

### Lint

Para executar a verificação do ESLint:

```bash
npm run lint
```

## Modelo 3D

O modelo usado pelo projeto fica em:

```text
public/models/praca.glb
```

Para trocar a praça por outro projeto, substitua esse arquivo mantendo o mesmo nome ou atualize o caminho em `src/components/Plaza.jsx`.

O caminho do modelo usa `import.meta.env.BASE_URL`, por isso o arquivo continua sendo encontrado quando a aplicação é publicada em uma subpasta do GitHub Pages.

## Como navegar

### Visão 360°

- Arraste com o mouse ou com o dedo para girar a câmera.
- Use o scroll do mouse ou o gesto de pinça para aproximar e afastar.

### Passear no modelo

- Arraste para olhar ao redor.
- Clique ou toque em uma área visível do projeto para caminhar até ela.
- A altura da câmera acompanha o piso detectado na geometria do modelo.

## Estrutura principal

```text
src/
  components/
    Plaza.jsx             # Carrega o modelo GLB e configura sombras
    ProjectViewer.jsx     # Canvas, iluminação e alternância de modos
    WalkControls.jsx      # Controles de olhar e caminhar
  App.jsx                 # Componente principal da aplicação
  App.css                 # Estilos do visualizador
  index.css               # Estilos globais
public/
  models/
    praca.glb             # Modelo 3D da obra
.github/
  workflows/
    deploy-pages.yml      # Build e deploy automático
```