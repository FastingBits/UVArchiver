class UsuariosService {
    async getUsers() {
        return await fetch('/api/usuarios').then(res => res.json());
    }
    async addUser(user) {
        console.log(user);
        return await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        }).then(res => res.json());
    }
    async updateUser(id, user) {
        return await fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        }).then(res => res.json());
    }
    async deleteUser(id) {
        return await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        }).then(res => res.json());
    }
    async searchUser(data) {
        return await fetch(`/api/usuarios/buscar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json());
    }
}

window.usuariosService = new UsuariosService();