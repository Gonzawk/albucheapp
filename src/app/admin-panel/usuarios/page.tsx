"use client";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import NavBarAdmin from "@/app/components/NavBarAdmin";
import FooterAdmin from "@/app/components/FooterAdmin";
import Image from "next/image";
import { User } from "../../../../types/User";

interface Role {
  roleId: number;
  roleName: string;
}

export default function UsuariosPanel() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Estados generales
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Estados para búsqueda: por ID o por Email
  const [searchType, setSearchType] = useState<"id" | "email">("id");
  const [searchValue, setSearchValue] = useState<string>("");

  // Estados para edición y creación
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [addingUser, setAddingUser] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<{
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    role: number;
  }>({
    nombreCompleto: "",
    email: "",
    passwordHash: "",
    role: 0,
  });

  // Estado para roles (para dropdown en Agregar/Editar Usuario)
  const [roles, setRoles] = useState<Role[]>([]);

  // Estado para cambiar contraseña (modal separado)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Función para obtener el token desde localStorage o de las cookies
  const getToken = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
      token = match ? match[2] : "";
    }
    console.log("Token obtenido:", token);
    return token;
  };

  // Función que retorna los headers con autorización
  const getAuthHeaders = (isJson: boolean = true) => {
    const token = getToken();
    const headers = {
      ...(isJson && { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
    };
    console.log("Headers enviados:", headers);
    return headers;
  };

  // Función para obtener usuarios
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/usuarios`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener los usuarios");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar usuario por ID
  const fetchUserById = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/usuarios/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Usuario no encontrado");
      const data: User = await res.json();
      setUsers([data]);
    } catch (err: any) {
      setError(err.message || "Error al buscar el usuario");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar usuario por Email
  const fetchUserByEmail = async (email: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/usuarios?email=${encodeURIComponent(email)}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Usuario no encontrado");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error al buscar el usuario");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener roles (para dropdown)
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/roles`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Error al obtener los roles");
      const data: Role[] = await res.json();
      setRoles(data);
    } catch (err: any) {
      console.error(err.message || "Error al obtener los roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [apiUrl]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      if (searchType === "id") fetchUserById(searchValue.trim());
      else fetchUserByEmail(searchValue.trim());
    } else {
      fetchUsers();
    }
  };

  const updateUser = async (updated: User) => {
    try {
      const res = await fetch(`${apiUrl}/api/usuarios/${updated.usuarioId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar el usuario");
      setUsers((prev) =>
        prev.map((u) => (u.usuarioId === updated.usuarioId ? updated : u))
      );
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message || "Error al actualizar el usuario");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/usuarios/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });
      if (!res.ok) throw new Error("Error al eliminar el usuario");
      setUsers((prev) => prev.filter((u) => u.usuarioId !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el usuario");
    }
  };

  const createUser = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/usuarios`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("Error al crear el usuario");
      const created: User = await res.json();
      setUsers((prev) => [...prev, created]);
      alert(`Usuario creado correctamente (ID: ${created.usuarioId})`);
      setNewUser({ nombreCompleto: "", email: "", passwordHash: "", role: 0 });
      setAddingUser(false);
    } catch (err: any) {
      alert(err.message || "Error al crear el usuario");
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (userId: number) => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/api/usuarios/${userId}/changePassword`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (!res.ok) throw new Error("Error al cambiar la contraseña");
      alert("Contraseña actualizada correctamente.");
      setShowChangePasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      alert(err.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBarAdmin />

      <header className="relative w-full h-48 md:h-64 lg:h-40 overflow-hidden">
        <Image
          src="/img/Albucheportadaweb.jpg" // Imagen ubicada en public/img
          alt="Panel de Administración"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">Gestión de Usuarios</h1>
        </div>
      </header>

      <main className="flex-grow p-6 space-y-6">
        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "id" | "email")}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded dark:text-gray-100"
          >
            <option value="id">Buscar por ID</option>
            <option value="email">Buscar por Email</option>
          </select>
          <input
            type="text"
            placeholder={searchType === "id" ? "ID del usuario..." : "Email del usuario..."}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded w-full md:w-auto dark:text-gray-100"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              fetchUsers();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={() => setAddingUser(true)}
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Agregar Usuario
          </button>
        </form>

        {/* Modal para crear usuario */}
        {addingUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
                Nuevo Usuario
              </h3>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  value={newUser.nombreCompleto}
                  onChange={(e) => setNewUser({ ...newUser, nombreCompleto: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                />
                {/* Input para contraseña al crear usuario */}
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={newUser.passwordHash}
                  onChange={(e) => setNewUser({ ...newUser, passwordHash: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                />
                {/* Dropdown para seleccionar rol */}
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: parseInt(e.target.value) })}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded dark:text-gray-100"
                  required
                >
                  <option value={0}>Selecciona un rol</option>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.roleName}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-4">
                  <button
                    onClick={createUser}
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setAddingUser(false)}
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal para editar usuario */}
        {editingUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
                Editar Usuario
              </h3>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (editingUser) updateUser(editingUser);
                }}
                className="flex flex-col space-y-4"
              >
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  value={editingUser.nombreCompleto}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, nombreCompleto: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                {/* Dropdown para seleccionar rol en edición */}
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: parseInt(e.target.value) })}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-2 rounded dark:text-gray-100"
                  required
                >
                  <option value={0}>Selecciona un rol</option>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.roleName}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Guardar
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowChangePasswordModal(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Cambiar Contraseña
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Modal para cambiar contraseña */}
        {showChangePasswordModal && editingUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
                Cambiar Contraseña
              </h3>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (editingUser) changePassword(editingUser.usuarioId);
                }}
                className="flex flex-col space-y-4"
              >
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded dark:bg-gray-700 dark:text-gray-100"
                  required
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Lista de usuarios */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Rol</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.usuarioId} className="text-center">
                  <td className="py-2 px-4 border-b">{user.usuarioId}</td>
                  <td className="py-2 px-4 border-b">{user.nombreCompleto}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.roleName || user.role}</td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteUser(user.usuarioId)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <FooterAdmin />
    </div>
  );
}
