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

  const saveUser = async () => {
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Usuarios
        </h1>

        {/* FORM */}
        <div className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border border-gray-300 p-2 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              onClick={saveUser}
            >
              {editingId ? "Actualizar Usuario" : "Crear Usuario"}
            </button>

            {editingId && (
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                onClick={resetForm}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-sm text-gray-800">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-600">
                <th className="py-2">Email</th>
                <th className="py-2">Nombre</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">{u.name}</td>
                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => startEdit(u)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}