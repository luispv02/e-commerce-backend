# E-Commerce Backend

BackEnd para la aplicación de e-commerce construida con Node.js y Express. Incluye autenticación, gestión de productos, carrito, pedidos y subida de imágenes con Cloudinary.

## Características
- Registro y login de usuarios
- JWT para sesiones
- CRUD completo de productos
- Filtrado y búsqueda de productos
- Validaciones
- Control de inventario
- Gestión de carrito de compra

## Tecnologías
- **Node.js** 
- **Express**
- **MongoDB(Mongoose)** 
- **JWT**
- **Multer**
- **Bcrypt** 
- **Cloudinary**
- **Express-validator** 
- **Helmet** 
- **CORS** 
- **Express-rate-limit**
- **Dotenv**

## Instalación
1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd e-commerce-backend
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
  Crea un archivo `.env` en la raíz del proyecto:
    ```env
    PORT=3000
    DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/e_commerce
    JWT_SECRET=clave_secreta_super_segura
    CLOUDINARY_CLOUD_NAME=tu_cloud_name
    CLOUDINARY_API_KEY=tu_api_key
    CLOUDINARY_API_KEY_SECRET=tu_api_secret
    ```

4. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```


## Endpoints

### Autenticación
Registro y login de usuarios/admin
```
POST    /api/auth/register          - Registrar nuevo usuario
POST    /api/auth/login             - Iniciar sesión
POST    /api/auth/renew             - Renovar token
```

### Productos públicos
Consultas sin autenticación (listado, búsqueda, detalle).
```
GET    /api/products                - Obtener todos los productos
GET    /api/products/:id            - Obtener producto por id
```

### Productos admin
Gestión de productos (CRUD, imágenes). Requiere JWT y rol admin.
```
GET    /api/admin/products          - Obtener todos los productos
GET    /api/admin/products/:id      - Obtener producto por id
POST   /api/admin/products          - Crear un producto nuevo
PUT    /api/admin/products/:id      - Modificar un producto
DELETE /api/admin/products/:id      - Eliminar un producto
```

### Carrito
Gestión del carrito. Requiere JWT.
```
GET    /api/cart                    - Obtener productos
POST   /api/cart                    - Agregar producto
POST   /api/cart/checkout           - Realizar compra del carrito
PUT    /api/cart/:id                - Modificar cantidades del producto
DELETE /api/cart/:id                - Eliminar producto
```

### Pedidos
Crear y consultar pedidos. Requiere JWT.
```
GET    /api/orders                  - Obtener productos comprados
```
