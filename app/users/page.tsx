"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    const load = async () => {
      await fetchUsers();
    };
    load();
  }, []);

  const createUser = async () => {
    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });

    resetForm();
    fetchUsers();
  };

  const updateUser = async () => {
    if (!editingId) return;

    await fetch(`/api/users/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });

    resetForm();
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEmail(user.email);
    setName(user.name || "");
  };

  const resetForm = () => {
    setEditingId(null);
    setEmail("");
    setName("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      {/* FORM */}
      <div className="flex gap-2 mb-6">
        <input
          className="border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          className="bg-black text-white px-4"
          onClick={editingId ? updateUser : createUser}
        >
          {editingId ? "Actualizar" : "Crear"}
        </button>

        {editingId && (
          <button
            className="border px-4"
            onClick={resetForm}
          >
            Cancelar
          </button>
        )}
      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th>Email</th>
            <th>Nombre</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => startEdit(u)}
                >
                  Editar
                </button>

                <button
                  className="text-red-500"
                  onClick={() => deleteUser(u.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}