import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;

const server = express();


let interessados = [];
let pets = [];
let adocoes = [];


server.use(session({
    secret: "chaveSecretaPetShop",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());


function verificarUsuarioLogado(req, res, next) {
    if (req.session.dadosLogin?.logado) {
        next();
    } else {
        res.redirect("/login");
    }
}


function layout(titulo, conteudo, ultimoAcesso = "") {
    return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">

        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <a class="navbar-brand" href="/">🐾 Pet Shop</a>
                <div class="text-white small">
                    ${ultimoAcesso ? `Último acesso: ${ultimoAcesso}` : ""}
                </div>
                <a class="btn btn-outline-light btn-sm" href="/logout">Sair</a>
            </div>
        </nav>

        <div class="container mt-4">
            ${conteudo}
        </div>

    </body>
    </html>
    `;
}


server.get("/", verificarUsuarioLogado, (req, res) => {
    const ultimoAcesso = req.cookies?.ultimoAcesso;
    res.cookie("ultimoAcesso", new Date().toLocaleString());

    res.send(layout("Menu", `
        <div class="card shadow text-center">
            <div class="card-body">
                <h3 class="card-title mb-4">Menu do Sistema</h3>
                <a class="btn btn-primary m-2" href="/interessados">👤 Cadastro de Interessados</a>
                <a class="btn btn-primary m-2" href="/pets">🐶 Cadastro de Pets</a>
                <a class="btn btn-success m-2" href="/adotar">❤️ Adotar um Pet</a>
            </div>
        </div>
    `, ultimoAcesso));
});


server.get("/login", (req, res) => {
    res.send(layout("Login", `
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h4 class="text-center mb-3">Login do Sistema</h4>
                        <form method="POST">
                            <input class="form-control mb-2" name="usuario" placeholder="Usuário" required>
                            <input class="form-control mb-3" type="password" name="senha" placeholder="Senha" required>
                            <button class="btn btn-primary w-100">Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `));
});

server.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "admin") {
        req.session.dadosLogin = { logado: true };
        res.redirect("/");
    } else {
        res.send(layout("Erro", `
            <div class="alert alert-danger">
                Usuário ou senha inválidos.
            </div>
            <a href="/login" class="btn btn-secondary">Voltar</a>
        `));
    }
});

server.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});


server.get("/interessados", verificarUsuarioLogado, (req, res) => {
    res.send(layout("Interessados", `
        <div class="card shadow">
            <div class="card-body">
                <h4>Cadastro de Interessados</h4>
                <form method="POST">
                    <input class="form-control mb-2" name="nome" placeholder="Nome" required>
                    <input class="form-control mb-2" name="email" placeholder="Email" required>
                    <input class="form-control mb-3" name="telefone" placeholder="Telefone" required>
                    <button class="btn btn-primary">Cadastrar</button>
                    <a href="/" class="btn btn-secondary">Menu</a>
                </form>
            </div>
        </div>
    `));
});

server.post("/interessados", verificarUsuarioLogado, (req, res) => {
    const { nome, email, telefone } = req.body;

    if (nome && email && telefone) {
        interessados.push({ nome, email, telefone });
        res.redirect("/listaInteressados");
    } else {
        res.send(layout("Erro", `
            <div class="alert alert-danger">Todos os campos são obrigatórios.</div>
            <a href="/interessados" class="btn btn-secondary">Voltar</a>
        `));
    }
});

server.get("/listaInteressados", verificarUsuarioLogado, (req, res) => {
    const linhas = interessados.map(i => `
        <tr>
            <td>${i.nome}</td>
            <td>${i.email}</td>
            <td>${i.telefone}</td>
        </tr>
    `).join("");

    res.send(layout("Lista de Interessados", `
        <div class="card shadow">
            <div class="card-body">
                <h4>Interessados Cadastrados</h4>
                <table class="table table-striped">
                    <tr><th>Nome</th><th>Email</th><th>Telefone</th></tr>
                    ${linhas}
                </table>
                <a href="/interessados" class="btn btn-secondary">Voltar</a>
            </div>
        </div>
    `));
});


server.get("/pets", verificarUsuarioLogado, (req, res) => {
    res.send(layout("Pets", `
        <div class="card shadow">
            <div class="card-body">
                <h4>Cadastro de Pets</h4>
                <form method="POST">
                    <input class="form-control mb-2" name="nome" placeholder="Nome" required>
                    <input class="form-control mb-2" name="raca" placeholder="Raça" required>
                    <input class="form-control mb-3" name="idade" placeholder="Idade" required>
                    <button class="btn btn-primary">Cadastrar</button>
                    <a href="/" class="btn btn-secondary">Menu</a>
                </form>
            </div>
        </div>
    `));
});

server.post("/pets", verificarUsuarioLogado, (req, res) => {
    const { nome, raca, idade } = req.body;

    if (nome && raca && idade) {
        pets.push({ nome, raca, idade });
        res.redirect("/listaPets");
    } else {
        res.send(layout("Erro", `
            <div class="alert alert-danger">Todos os campos são obrigatórios.</div>
            <a href="/pets" class="btn btn-secondary">Voltar</a>
        `));
    }
});

server.get("/listaPets", verificarUsuarioLogado, (req, res) => {
    const linhas = pets.map(p => `
        <tr>
            <td>${p.nome}</td>
            <td>${p.raca}</td>
            <td>${p.idade}</td>
        </tr>
    `).join("");

    res.send(layout("Lista de Pets", `
        <div class="card shadow">
            <div class="card-body">
                <h4>Pets Cadastrados</h4>
                <table class="table table-striped">
                    <tr><th>Nome</th><th>Raça</th><th>Idade</th></tr>
                    ${linhas}
                </table>
                <a href="/pets" class="btn btn-secondary">Voltar</a>
            </div>
        </div>
    `));
});


server.get("/adotar", verificarUsuarioLogado, (req, res) => {
    const listaInteressados = interessados.map(i =>
        `<option value="${i.nome}">${i.nome}</option>`
    ).join("");

    const listaPets = pets.map(p =>
        `<option value="${p.nome}">${p.nome}</option>`
    ).join("");

    res.send(layout("Adoção", `
        <div class="card shadow">
            <div class="card-body">
                <h4>Adotar um Pet</h4>
                <form method="POST">
                    <select class="form-select mb-2" name="interessado" required>
                        <option value="">Selecione o interessado</option>
                        ${listaInteressados}
                    </select>
                    <select class="form-select mb-3" name="pet" required>
                        <option value="">Selecione o pet</option>
                        ${listaPets}
                    </select>
                    <button class="btn btn-success">Registrar Adoção</button>
                    <a href="/" class="btn btn-secondary">Menu</a>
                </form>
            </div>
        </div>
    `));
});

server.post("/adotar", verificarUsuarioLogado, (req, res) => {
    const { interessado, pet } = req.body;

    if (interessado && pet) {
        adocoes.push({
            interessado,
            pet,
            data: new Date().toLocaleString()
        });

        res.send(layout("Sucesso", `
            <div class="alert alert-success">
                Adoção registrada com sucesso!
            </div>
            <a href="/" class="btn btn-primary">Voltar ao Menu</a>
        `));
    } else {
        res.send(layout("Erro", `
            <div class="alert alert-danger">
                Selecione um interessado e um pet.
            </div>
            <a href="/adotar" class="btn btn-secondary">Voltar</a>
        `));
    }
});


server.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
