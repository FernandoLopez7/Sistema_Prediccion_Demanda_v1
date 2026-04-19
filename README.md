# Sistema de Predicción de Demanda

Proyecto hecho con **Next.js + Prisma + PostgreSQL + Firebase Authentication**

---

## ⚙️ Setup rápido

1. Instalar dependencias:

```bash
npm install
```

2. Configurar Firebase Authentication:

### Si ya tienes un proyecto de Firebase existente:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto existente
3. Ve a **Configuración del proyecto** (icono de engranaje)
4. Desplázate hacia abajo hasta **Tus apps**
5. Si no tienes una app web, haz clic en **Agregar app** y selecciona **Web**
6. Copia la configuración de Firebase (API Key, Auth Domain, etc.)

### Si necesitas crear un nuevo proyecto de Firebase:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Haz clic en **Crear un proyecto**
3. Sigue los pasos para crear el proyecto
4. Una vez creado, ve a **Authentication** en el menú lateral
5. Ve a la pestaña **Método de inicio de sesión**
6. Habilita **Correo electrónico/contraseña**
7. Ve a **Configuración del proyecto** y agrega una app web
8. Copia la configuración

9. Configurar variables de entorno:

Copia el archivo `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores de Firebase:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Database (ya configurado)
DATABASE_URL="postgresql://erik:1234@localhost:5432/demanda"
```

4. Configurar la base de datos:

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev
```

5. Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

6. Abrir [http://localhost:3000](http://localhost:3000) en tu navegador

---

## 🔐 Autenticación

El sistema utiliza Firebase Authentication para manejar el inicio de sesión de usuarios. Los usuarios pueden:

- Registrarse con correo electrónico y contraseña
- Iniciar sesión con sus credenciales
- Acceder a un dashboard protegido después del login

### Creando usuarios de prueba:

Para crear usuarios de prueba en Firebase:

1. Ve a la **Consola de Firebase** > **Authentication** > **Users**
2. Haz clic en **Agregar usuario**
3. Ingresa email y contraseña
4. El usuario podrá iniciar sesión inmediatamente

---

## 📁 Estructura del proyecto

```
app/
├── api/                    # API routes
│   ├── materials/         # Gestión de materiales
│   ├── products/          # Gestión de productos
│   ├── recipes/           # Gestión de recetas
│   ├── sales/             # Gestión de ventas
│   └── users/             # Gestión de usuarios
├── dashboard/             # Dashboard protegido
├── globals.css           # Estilos globales
├── layout.tsx            # Layout principal
└── page.tsx              # Página de login

lib/
├── auth-context.tsx      # Contexto de autenticación
├── auth-guard.tsx        # Protección de rutas
├── firebase.ts           # Configuración de Firebase
└── prisma.ts             # Cliente de Prisma

prisma/
├── schema.prisma         # Esquema de la base de datos
└── migrations/           # Migraciones de base de datos
```

---

## 🚀 Despliegue

### Variables de entorno en producción:

Asegúrate de configurar estas variables en tu plataforma de despliegue:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `DATABASE_URL`

### Configuración de Firebase para producción:

1. En la consola de Firebase, ve a **Authentication**
2. Configura los dominios autorizados en **Configuración**
3. Agrega tu dominio de producción a la lista de dominios autorizados

---

## 📚 Tecnologías utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Firebase Authentication** - Autenticación
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **React Context** - Gestión de estado

````

2. Configurar `.env`:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/postgres"
````

3. Crear tablas:

```bash
npx prisma migrate dev --name init
```

4. Generar cliente:

```bash
npx prisma generate
```

5. Ejecutar proyecto:

```bash
npm run dev
```

---

## 🗄️ Prisma

Prisma se usa para:

- Crear tablas (migraciones)
- Conectar con la base de datos
- Hacer queries desde el backend

---

## 👤 Usuario (IMPORTANTE)

El sistema usa temporalmente:

```ts
const userId = "1";
```

👉 Debes crear un usuario en la base de datos y poner su `id = "1"`

Si no haces esto:

- No funcionarán las APIs
- No verás datos

---

## 📊 Flujo básico

```txt
XML → Upload → Confirm → Base de datos → Predicción
```

---

## 📌 Comandos útiles

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
npm run dev
```

---
