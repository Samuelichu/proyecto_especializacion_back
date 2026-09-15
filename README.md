## Descripción del Proyecto
**TaskFlow** es una aplicación web para la gestión y organización de tareas que permite crear, editar y eliminar pendientes de forma interactiva. El objetivo principal de este proyecto es implementar una arquitectura cloud resiliente en **AWS**, aplicando buenas prácticas de despliegue, seguridad y entrega continua (CI/CD) aprendidas durante el curso.

---

## Arquitectura de Infraestructura
La solución está estructurada en AWS de la siguiente manera:

- **Gestión de Dominio y DNS (Cloudflare):** Cloudflare actúa como el proveedor DNS principal, administrando la resolución del dominio para el frontend y los subdominios para el acceso a las APIs del backend.
- **Frontend (AWS Amplify):** Aloja la aplicación de cliente, conectada al dominio principal y con despliegue automático ante cambios en el repositorio.
- **Seguridad y SSL (AWS Certificate Manager - ACM):** Gestiona y valida los certificados SSL/TLS para asegurar las comunicaciones HTTPS del dominio y sus subdominios.
- **Orquestación de API (Amazon API Gateway):** Actúa como el punto de entrada unificado y proxy seguro para enrutar las peticiones desde el frontend hacia la capa de aplicación.
- **Capa de Aplicación (AWS Elastic Beanstalk):** Ejecuta la lógica del backend dentro de una subred en AWS, gestionando la infraestructura del servidor de forma escalable.
- **Persistencia de Datos (Amazon RDS):** Base de datos relacional aislada en la capa privada de la red. La conectividad con Elastic Beanstalk se gestiona de forma segura mediante **Security Groups** y variables de entorno.
- **Integración y Despliegue Continuo (AWS CodePipeline & GitHub):** Despliegue automatizado por eventos. Cada *push* o *merge* en GitHub activa automáticamente las etapas de compilación, construcción y despliegue hacia AWS Amplify (frontend) y AWS Elastic Beanstalk (backend), generando versiones actualizadas de forma transparente.