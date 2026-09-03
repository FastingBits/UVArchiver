class DepartamentosService {
    async getDepartamentos() {
        return await fetch('/api/departamentos').then(res => res.json());
    }
    async addDepartamento(dept) {
        return await fetch('/api/departamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept)
        }).then(res => res.json());
    }
    async updateDepartamento(id, dept) {
        return await fetch(`/api/departamentos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept)
        }).then(res => res.json());
    }
    async deleteDepartamento(id) {
        return await fetch(`/api/departamentos/${id}`, {
            method: 'DELETE'
        }).then(res => res.json());
    }
}

window.departamentosService = new DepartamentosService();